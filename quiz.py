#!/usr/bin/env python3

import json
import random
import time
import threading
import sys
from typing import List, Dict

class QuizApp:
    def __init__(self, json_file: str):
        self.json_file = json_file
        self.questions = []
        self.current_pool = []
        self.correct_answers = 0
        self.target_correct = 25
        self.time_limit = 20
        self.answer_given = False
        self.user_answer = None
        
    def load_questions(self) -> bool:
        try:
            with open(self.json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.questions = data['questions']
            return True
        except FileNotFoundError:
            print(f"Erreur: Le fichier {self.json_file} n'a pas été trouvé.")
            return False
        except json.JSONDecodeError:
            print(f"Erreur: Le fichier {self.json_file} n'est pas un JSON valide.")
            return False
        except KeyError:
            print("Erreur: Le fichier JSON doit contenir une clé 'questions'.")
            return False
    
    def initialize_pool(self):
        if len(self.questions) < 10:
            print("Erreur: Il faut au moins 10 questions dans le fichier JSON.")
            return False
        
        self.current_pool = random.sample(self.questions, min(10, len(self.questions)))
        return True
    
    def add_question_to_pool(self):
        available_questions = [q for q in self.questions if q not in self.current_pool]
        if available_questions:
            new_question = random.choice(available_questions)
            self.current_pool.append(new_question)
    
    def display_question(self, question: Dict) -> None:
        print(f"\n{'='*60}")
        print(f"Question: {question['question']}")
        print("Options:")
        for i, option in enumerate(question['options']):
            print(f"  {i + 1}. {option}")
        print(f"{'='*60}")
        print(f"Vous avez {self.time_limit} secondes pour répondre.")
        print("Tapez le numéro de votre réponse (1, 2, 3, ou 4):")
    
    def get_user_input(self):
        try:
            self.user_answer = input().strip()
            self.answer_given = True
        except:
            self.answer_given = True
    
    def ask_question(self, question: Dict) -> bool:
        self.display_question(question)
        
        self.answer_given = False
        self.user_answer = None
        
        input_thread = threading.Thread(target=self.get_user_input)
        input_thread.daemon = True
        input_thread.start()
        
        start_time = time.time()
        while not self.answer_given and (time.time() - start_time) < self.time_limit:
            remaining_time = self.time_limit - int(time.time() - start_time)
            if remaining_time != getattr(self, 'last_remaining', -1):
                print(f"\rTemps restant: {remaining_time} secondes", end="", flush=True)
                self.last_remaining = remaining_time
            time.sleep(0.1)
        
        print("\n")
        
        if not self.answer_given or self.user_answer is None:
            print("⏰ Temps écoulé ! Mauvaise réponse.")
            return False
        
        try:
            user_choice = int(self.user_answer) - 1
            if 0 <= user_choice < len(question['options']):
                if user_choice == question['correct_answer']:
                    print("✅ Bonne réponse !")
                    return True
                else:
                    correct_option = question['options'][question['correct_answer']]
                    print(f"❌ Mauvaise réponse. La bonne réponse était: {correct_option}")
                    return False
            else:
                print("❌ Réponse invalide. Veuillez entrer un numéro entre 1 et 4.")
                return False
        except ValueError:
            print("❌ Réponse invalide. Veuillez entrer un numéro.")
            return False
    
    def run_quiz(self):
        print("🎯 Bienvenue au Quiz QCM !")
        print(f"Objectif: Répondre correctement à {self.target_correct} questions")
        print(f"Temps par question: {self.time_limit} secondes")
        print("Appuyez sur Entrée pour commencer...")
        input()
        
        if not self.load_questions():
            return
        
        if not self.initialize_pool():
            return
        
        while self.correct_answers < self.target_correct and self.current_pool:
            print(f"\n📊 Progression: {self.correct_answers}/{self.target_correct} bonnes réponses")
            print(f"📝 Questions dans la pool: {len(self.current_pool)}")
            
            current_question = random.choice(self.current_pool)
            
            if self.ask_question(current_question):
                self.correct_answers += 1
                self.current_pool.remove(current_question)
                self.add_question_to_pool()
                
                if self.correct_answers < self.target_correct:
                    print(f"🎉 Excellente réponse ! Plus que {self.target_correct - self.correct_answers} questions à réussir.")
            else:
                print("🔄 Cette question sera reposée plus tard.")
        
        if self.correct_answers >= self.target_correct:
            print(f"\n🏆 Félicitations ! Vous avez atteint l'objectif de {self.target_correct} bonnes réponses !")
        else:
            print("\n😔 Plus de questions disponibles. Quiz terminé.")
        
        print(f"Score final: {self.correct_answers}/{self.target_correct}")

def main():
    if len(sys.argv) != 2:
        print("Usage: python quiz.py <fichier_questions.json>")
        print("Exemple: python quiz.py questions.json")
        sys.exit(1)
    
    quiz = QuizApp(sys.argv[1])
    try:
        quiz.run_quiz()
    except KeyboardInterrupt:
        print("\n\n👋 Quiz interrompu par l'utilisateur.")
    except Exception as e:
        print(f"\n❌ Une erreur inattendue s'est produite: {e}")

if __name__ == "__main__":
    main()