<template>
  <div class="container">
    <div class="main-content">
      <div class="header" v-if="!isQuizStarted">
        <h1 class="title">🎯 Quiz QCM</h1>
        <p class="subtitle">Répondez correctement à {{ targetCorrect }} questions pour gagner !</p>
      </div>

      <!-- File Upload Section -->
      <div v-if="currentView === 'upload'" id="file-upload" class="file-input">
        <div id="predefined-quizzes" class="predefined-quizzes">
          <h3>🎯 Quizz disponibles</h3>
          <div id="quiz-list" class="quiz-list">
            <div v-if="isLoadingQuizzes" class="loading">
              <div class="spinner"></div>
              <p>Chargement des quizz...</p>
            </div>
            <div v-else-if="availableQuizzes.length === 0" class="loading">
              <p style="color: #ff3742;">Erreur lors du chargement des quizz disponibles</p>
            </div>
            <div v-else>
              <div 
                v-for="quiz in availableQuizzes" 
                :key="quiz.file"
                class="quiz-card"
                :class="{ selected: selectedQuiz?.file === quiz.file }"
                @click="selectQuiz(quiz)"
              >
                <div class="quiz-card-name">{{ quiz.name }}</div>
                <div class="quiz-card-description">{{ quiz.description }}</div>
              </div>
            </div>
          </div>
          <div class="divider">
            <span>OU</span>
          </div>
        </div>
        <label for="json-file" class="file-label">
          📁 Choisir un fichier JSON de questions
        </label>
        <input type="file" id="json-file" accept=".json" @change="loadQuestionsFromFile">
      </div>

      <!-- Start Screen -->
      <div v-if="currentView === 'start'" id="start-screen">
        <div class="header">
          <h2>🎯 Quiz prêt à démarrer !</h2>
          <p class="subtitle">Choisissez votre mode de jeu</p>
        </div>
        <div class="buttons">
          <button @click="startQuiz" class="btn btn-primary">🚀 Mode Entraînement</button>
          <button @click="startTest" class="btn btn-primary">📝 Mode Test (10 questions)</button>
          <button @click="changeFile" class="btn btn-secondary">📁 Changer de fichier</button>
        </div>
      </div>

      <!-- Quiz Content -->
      <div v-if="currentView === 'quiz'" id="quiz-content">
        <div class="progress">
          <div class="progress-item">
            <div class="progress-number">{{ displayScore }}</div>
            <div class="progress-label">Score</div>
          </div>
        </div>

        <div id="timer" class="timer-progress">
          <div class="progress-bar">
            <div 
              id="progress-fill" 
              class="progress-fill"
              :class="{ warning: timeLeft <= 5 }"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>

        <div v-if="currentQuestion" id="question-container" class="question-card">
          <div id="question-text" class="question-text">
            <span v-if="isMultipleChoiceQuestion" class="multi-tag">multi</span>
            {{ questionText }}
          </div>
          <div id="options-container" class="options">
            <div 
              v-for="(option, index) in shuffledOptions" 
              :key="index"
              class="option"
              :class="{
                selected: isMultipleChoiceQuestion ? selectedAnswers.includes(option.originalIndex) : selectedAnswer === option.originalIndex,
                correct: showResults && isCorrectAnswer(option.originalIndex),
                incorrect: showResults && ((isMultipleChoiceQuestion && selectedAnswers.includes(option.originalIndex)) || (!isMultipleChoiceQuestion && selectedAnswer === option.originalIndex)) && !isCorrectAnswer(option.originalIndex),
                disabled: !isMultipleChoiceQuestion && selectedAnswer !== null
              }"
              @click="selectAnswer(option.originalIndex)"
            >
              {{ option.text }}
            </div>
          </div>
          
          <!-- Bouton de validation pour les questions à réponses multiples -->
          <div v-if="isMultipleChoiceQuestion && !showResults" class="validate-button-container">
            <button @click="validateMultipleChoice" class="btn btn-validate" :disabled="selectedAnswers.length === 0">
              ✓ Valider ({{ selectedAnswers.length }} réponse(s))
            </button>
          </div>
        </div>

        <div class="buttons">
          <button @click="restart" class="btn btn-secondary">Recommencer</button>
          <button @click="resetQuestionHistory" class="btn btn-secondary">🔄 Réinitialiser l'historique</button>
        </div>
      </div>

      <!-- Final Result -->
      <div v-if="currentView === 'result'" id="final-result">
        <div class="final-score">
          <h2>{{ resultEmoji }} {{ resultTitle }}</h2>
          <p v-if="!isTestMode">Vous avez atteint l'objectif de {{ targetCorrect }} bonnes réponses !</p>
          <p v-else>Votre note: <strong>{{ correctAnswers }}/10</strong> ({{ testPercentage }}%)</p>
          <p v-if="isTestMode">{{ testMessage }}</p>
          <button @click="restart" class="btn btn-secondary" style="margin-top: 20px;">
            {{ isTestMode ? 'Recommencer' : 'Rejouer' }}
          </button>
          <button 
            v-if="wrongAnswersFirstTry.length > 0"
            @click="showWrongAnswers" 
            class="btn btn-primary" 
            style="margin-top: 10px;"
          >
            📋 Voir les questions ratées
          </button>
        </div>
      </div>

      <!-- Wrong Answers Display -->
      <div v-if="currentView === 'wrongAnswers'" class="wrong-answers-container">
        <div class="wrong-answers-header">
          <h2>📋 Questions à revoir</h2>
          <p>Voici les {{ wrongAnswersFirstTry.length }} question(s) que vous avez ratée(s) dès le premier essai :</p>
        </div>
        
        <div 
          v-for="(item, index) in wrongAnswersFirstTry" 
          :key="index"
          class="wrong-answer-item"
        >
          <div class="wrong-answer-question">
            Question {{ index + 1 }}: {{ item.question.question }}
          </div>
          <div class="wrong-answer-responses">
            <div class="wrong-answer-user">
              ❌ Votre réponse: {{ item.userAnswer }}
            </div>
            <div class="wrong-answer-correct">
              ✅ Bonne réponse: {{ item.correctAnswer }}
            </div>
          </div>
          <div v-if="item.explanation" class="wrong-answer-explanation">
            <div class="wrong-answer-explanation-title">💡 Explication</div>
            <div>{{ item.explanation }}</div>
          </div>
        </div>

        <button @click="backToResults" class="back-to-results-btn">
          ← Retour aux résultats
        </button>
      </div>

      <!-- Loading Screen -->
      <div v-if="isLoading" id="loading">
        <div class="loading">
          <div class="spinner"></div>
          <p>Chargement du quiz...</p>
        </div>
      </div>
    </div>

    <!-- Question Tracker -->
    <div v-if="isQuizStarted" class="question-tracker" id="question-tracker">
      <div class="tracker-title">Questions</div>
      <div 
        class="tracker-grid" 
        :class="{ 'two-columns': needTwoColumns }"
      >
        <div 
          v-for="(result, index) in trackerCircles"
          :key="index"
          class="question-circle"
          :class="getCircleClass(result, index)"
        >
          {{ getCircleText(result, index) }}
        </div>
      </div>
    </div>
  </div>

  <!-- Modal for results -->
  <div v-if="showModal" class="modal-overlay" @click="closeModal">
    <div class="modal" :class="{ show: showModal }" @click.stop>
      <div class="modal-result-icon">{{ modalIcon }}</div>
      <div class="modal-result-title" :class="modalTitleClass">{{ modalTitle }}</div>
      <div class="modal-result-message">{{ modalMessage }}</div>
      
      <div v-if="currentQuestion?.explanation" class="modal-explanation">
        <div class="modal-explanation-title">💡 Explication</div>
        <div class="modal-explanation-text">{{ currentQuestion.explanation }}</div>
      </div>
      
      <div class="modal-button-container">
        <button @click="goToNextQuestion" class="btn btn-primary">
          ➡️ Prochaine question
        </button>
      </div>
    </div>
  </div>

  <!-- Toast notifications -->
  <div 
    v-for="toast in toasts" 
    :key="toast.id"
    class="toast"
    :class="[toast.className, { show: toast.show }]"
  >
    <div class="toast-icon">{{ toast.icon }}</div>
    <div class="toast-title">{{ toast.title }}</div>
    <div class="toast-message">{{ toast.message }}</div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useQuizLogic } from './composables/useQuizLogic'
import { useTimer } from './composables/useTimer'
import { useAudio } from './composables/useAudio'
import { useToast } from './composables/useToast'

export default {
  name: 'App',
  setup() {
    const {
      // State
      questions,
      currentPool,
      seenQuestions,
      correctAnswers,
      currentStreak,
      targetCorrect,
      currentQuestion,
      selectedAnswer,
      selectedAnswers,
      availableQuizzes,
      selectedQuiz,
      currentQuizKey,
      isTestMode,
      testQuestions,
      currentTestIndex,
      questionResults,
      answeredQuestions,
      failedQuestions,
      allAttemptedQuestions,
      wrongAnswersFirstTry,
      currentView,
      isLoading,
      isLoadingQuizzes,
      showModal,
      showResults,
      shuffledOptions,
      
      // Modal state
      modalIcon,
      modalTitle,
      modalMessage,
      modalTitleClass,
      
      // Methods
      loadAvailableQuizzes,
      selectQuiz,
      loadQuestionsFromFile,
      startQuiz,
      startTest,
      changeFile,
      nextQuestion,
      selectAnswer,
      validateMultipleChoice,
      checkAnswer,
      restart,
      resetQuestionHistory,
      goToNextQuestion,
      closeModal,
      showWrongAnswers,
      backToResults,
      
      // Computed
      displayScore,
      isQuizStarted,
      questionText,
      trackerCircles,
      needTwoColumns,
      getCircleClass,
      getCircleText,
      resultEmoji,
      resultTitle,
      testPercentage,
      testMessage,
      isMultipleChoiceQuestion
    } = useQuizLogic()

    const {
      timeLeft,
      timeLimit,
      progressPercentage,
      startTimer,
      clearTimer
    } = useTimer(checkAnswer)

    const { playSuccessSound } = useAudio()
    const { toasts, showToast } = useToast()

    // Initialize app
    onMounted(() => {
      loadAvailableQuizzes()
    })

    // Watch for correct answers to play sound and check streaks
    watch([correctAnswers, currentStreak], () => {
      let isAnswerCorrect = false
      
      if (isMultipleChoiceQuestion.value) {
        const correctAnswersArray = currentQuestion.value?.correct_answers || []
        isAnswerCorrect = correctAnswersArray.length === selectedAnswers.value.length && 
                         correctAnswersArray.every(answer => selectedAnswers.value.includes(answer))
      } else {
        const correctAnswersArray = currentQuestion.value?.correct_answers || [currentQuestion.value?.correct_answer]
        isAnswerCorrect = correctAnswersArray.includes(selectedAnswer.value)
      }
      
      if (isAnswerCorrect) {
        playSuccessSound()
        checkStreakMilestones()
      }
    })

    // Watch for question changes to start timer
    watch(currentQuestion, (newQuestion) => {
      if (newQuestion && !showModal.value) {
        nextTick(() => {
          clearTimer() // Clear any existing timer first
          startTimer()
        })
      }
    })

    // Clear timer when modal is shown, restart when closed
    watch(showModal, (isModalVisible, oldValue) => {
      if (isModalVisible) {
        clearTimer()
      } else if (oldValue && currentQuestion.value && currentView.value === 'quiz') {
        // Modal was just closed and we have a current question
        nextTick(() => {
          startTimer()
        })
      }
    })

    const checkStreakMilestones = () => {
      if (currentStreak.value === 5) {
        showToast('🔥', 'Série de 5 !', 'Vous êtes en feu !', 'streak-5')
      } else if (currentStreak.value === 10) {
        showToast('⚡', 'Série de 10 !', 'Incroyable performance !', 'streak-10')
      } else if (currentStreak.value === 20) {
        showToast('👑', 'Série de 20 !', 'Vous êtes un champion !', 'streak-20')
      }
    }

    const isCorrectAnswer = (answerIndex) => {
      if (!currentQuestion.value) return false
      const correctAnswers = currentQuestion.value.correct_answers || [currentQuestion.value.correct_answer]
      return correctAnswers.includes(answerIndex)
    }

    return {
      // State
      questions,
      currentPool,
      seenQuestions,
      correctAnswers,
      currentStreak,
      targetCorrect,
      currentQuestion,
      selectedAnswer,
      selectedAnswers,
      availableQuizzes,
      selectedQuiz,
      currentQuizKey,
      isTestMode,
      testQuestions,
      currentTestIndex,
      questionResults,
      answeredQuestions,
      failedQuestions,
      allAttemptedQuestions,
      wrongAnswersFirstTry,
      currentView,
      isLoading,
      isLoadingQuizzes,
      showModal,
      showResults,
      shuffledOptions,
      
      // Timer
      timeLeft,
      timeLimit,
      progressPercentage,
      
      // Modal
      modalIcon,
      modalTitle,
      modalMessage,
      modalTitleClass,
      
      // Toast
      toasts,
      
      // Methods
      loadAvailableQuizzes,
      selectQuiz,
      loadQuestionsFromFile,
      startQuiz,
      startTest,
      changeFile,
      nextQuestion,
      selectAnswer,
      validateMultipleChoice,
      checkAnswer,
      restart,
      resetQuestionHistory,
      goToNextQuestion,
      closeModal,
      showWrongAnswers,
      backToResults,
      isCorrectAnswer,
      
      // Computed
      displayScore,
      isQuizStarted,
      questionText,
      trackerCircles,
      needTwoColumns,
      getCircleClass,
      getCircleText,
      resultEmoji,
      resultTitle,
      testPercentage,
      testMessage,
      isMultipleChoiceQuestion
    }
  }
}
</script>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.container {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    padding: 40px;
    max-width: 1200px;
    width: 100%;
    text-align: center;
    display: flex;
    gap: 30px;
}

.main-content {
    flex: 1;
}

.question-tracker {
    width: 200px;
    background: #f8f9fa;
    border-radius: 15px;
    padding: 20px;
}

.tracker-title {
    font-size: 1.1em;
    font-weight: bold;
    color: #333;
    margin-bottom: 20px;
    text-align: center;
}

.tracker-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    max-height: calc(100vh - 200px);
    overflow: visible;
}

.tracker-grid.two-columns {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.question-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.9em;
    transition: all 0.3s ease;
    background: white;
    color: #666;
}

.tracker-grid.two-columns .question-circle {
    width: 35px;
    height: 35px;
    font-size: 0.8em;
}

.question-circle.correct {
    background: #2ed573;
    border-color: #2ed573;
    color: white;
}

.question-circle.incorrect {
    background: #ffd700;
    border-color: #ffd700;
    color: #333;
}

.question-circle.correct-retry {
    background: #2ed573;
    border: 4px solid #ffd700;
    color: white;
}

.question-circle.current {
    border-color: #667eea;
    background: #f0f4ff;
    color: #667eea;
    animation: pulse-circle 2s infinite;
}

.question-circle.current-empty {
    border: 2px solid #667eea;
    background: white;
    color: #667eea;
    animation: pulse-circle 2s infinite;
}

@keyframes pulse-circle {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

.header {
    margin-bottom: 30px;
}

.title {
    color: #333;
    font-size: 2.5em;
    margin-bottom: 10px;
    font-weight: 700;
}

.subtitle {
    color: #666;
    font-size: 1.2em;
}

.progress {
    background: #f0f0f0;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.progress-item {
    background: white;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.progress-number {
    font-size: 2em;
    font-weight: bold;
    color: #667eea;
}

.progress-label {
    color: #666;
    font-size: 0.9em;
}

.timer-progress {
    margin-bottom: 30px;
    height: 8px;
}

.progress-bar {
    width: 100%;
    height: 100%;
    background-color: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(45deg, #2ed573, #1dd1a1);
    border-radius: 4px;
    transition: width 1s linear;
    width: 100%;
}

.progress-fill.warning {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    animation: pulse-fill 1s infinite;
}

@keyframes pulse-fill {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.question-card {
    background: #f8f9fa;
    border-radius: 15px;
    padding: 30px;
    margin-bottom: 30px;
    text-align: left;
}

.question-text {
    font-size: 1.3em;
    color: #333;
    margin-bottom: 25px;
    line-height: 1.5;
}

.options {
    display: grid;
    gap: 15px;
}

.option {
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    padding: 15px 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.1em;
}

.option:hover:not(.disabled) {
    border-color: #667eea;
    background: #f0f4ff;
}

.option.selected {
    border-color: #667eea;
    background: #667eea;
    color: white;
}

.option.correct {
    border-color: #2ed573;
    background: #2ed573;
    color: white;
}

.option.incorrect {
    border-color: #ff3742;
    background: #ff3742;
    color: white;
}

.option.disabled {
    pointer-events: none;
    opacity: 0.7;
}

.buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.btn {
    padding: 15px 30px;
    border: none;
    border-radius: 10px;
    font-size: 1.1em;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
}

.btn-primary {
    background: #667eea;
    color: white;
}

.btn-primary:hover {
    background: #5a6fd8;
    transform: translateY(-2px);
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #545b62;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.file-input {
    margin-bottom: 30px;
}

.file-label {
    display: inline-block;
    background: #667eea;
    color: white;
    padding: 15px 30px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.1em;
}

.file-label:hover {
    background: #5a6fd8;
    transform: translateY(-2px);
}

input[type="file"] {
    display: none;
}

.final-score {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px;
    border-radius: 20px;
    margin-top: 30px;
}

.final-score h2 {
    font-size: 2.5em;
    margin-bottom: 15px;
}

.final-score p {
    font-size: 1.3em;
}

.loading {
    text-align: center;
    padding: 40px;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
}

.modal {
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 600px;
    width: 90%;
    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    text-align: center;
    transform: scale(0.8);
    opacity: 0;
    transition: all 0.3s ease;
}

.modal.show {
    transform: scale(1);
    opacity: 1;
}

.modal-result-icon {
    font-size: 4em;
    margin-bottom: 20px;
}

.modal-result-title {
    font-size: 2em;
    font-weight: bold;
    margin-bottom: 20px;
}

.modal-result-title.correct {
    color: #2ed573;
}

.modal-result-title.incorrect {
    color: #ff3742;
}

.modal-result-message {
    font-size: 1.2em;
    margin-bottom: 20px;
    line-height: 1.5;
    color: #333;
}

.modal-explanation {
    background: #e3f2fd;
    border: 1px solid #bbdefb;
    border-radius: 15px;
    padding: 20px;
    margin: 20px 0;
    color: #1565c0;
    text-align: left;
}

.modal-explanation-title {
    font-weight: bold;
    margin-bottom: 10px;
    color: #0d47a1;
    font-size: 1.1em;
}

.modal-explanation-text {
    line-height: 1.5;
}

.modal-button-container {
    margin-top: 30px;
    text-align: center;
}

.modal-button-container .btn {
    font-size: 1.2em;
    padding: 15px 30px;
    min-width: 200px;
}

.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 25px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    font-size: 1.1em;
    font-weight: bold;
    z-index: 2000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 300px;
    text-align: center;
}

.toast.show {
    transform: translateX(0);
}

.toast.streak-5 {
    background: linear-gradient(135deg, #2ed573 0%, #1dd1a1 100%);
}

.toast.streak-10 {
    background: linear-gradient(135deg, #ff9f43 0%, #ee5a24 100%);
}

.toast.streak-20 {
    background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
}

.toast-icon {
    font-size: 1.5em;
    margin-bottom: 8px;
    display: block;
}

.toast-title {
    font-size: 1.2em;
    margin-bottom: 5px;
}

.toast-message {
    font-size: 0.9em;
    opacity: 0.9;
}

.wrong-answers-container {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    padding: 40px;
    max-width: 1200px;
    width: 100%;
    margin: 20px auto;
}

.wrong-answers-header {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
}

.wrong-answers-header h2 {
    font-size: 2em;
    margin-bottom: 10px;
    color: #ff3742;
}

.wrong-answers-header p {
    font-size: 1.2em;
    color: #666;
}

.wrong-answer-item {
    background: #f8f9fa;
    border-radius: 15px;
    padding: 25px;
    margin-bottom: 25px;
    border-left: 5px solid #ff3742;
}

.wrong-answer-question {
    font-size: 1.3em;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
}

.wrong-answer-responses {
    display: grid;
    gap: 10px;
    margin-bottom: 15px;
}

.wrong-answer-user {
    padding: 10px 15px;
    border-radius: 8px;
    background: #ffe6e6;
    border: 2px solid #ff3742;
    color: #d32f2f;
}

.wrong-answer-correct {
    padding: 10px 15px;
    border-radius: 8px;
    background: #e6f7e6;
    border: 2px solid #2ed573;
    color: #1b5e20;
    font-weight: bold;
}

.wrong-answer-explanation {
    background: #e3f2fd;
    border: 1px solid #bbdefb;
    border-radius: 10px;
    padding: 15px;
    color: #1565c0;
}

.wrong-answer-explanation-title {
    font-weight: bold;
    margin-bottom: 8px;
    color: #0d47a1;
    font-size: 1.05em;
}

.back-to-results-btn {
    display: block;
    margin: 30px auto 0;
    padding: 15px 30px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.1em;
    cursor: pointer;
    transition: all 0.3s ease;
}

.back-to-results-btn:hover {
    background: #5a6fd8;
    transform: translateY(-2px);
}

.spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 2s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.predefined-quizzes {
    margin-bottom: 30px;
}

.predefined-quizzes h3 {
    color: #333;
    font-size: 1.3em;
    margin-bottom: 20px;
    text-align: center;
}

.quiz-list {
    display: grid;
    gap: 15px;
    margin-bottom: 25px;
}

.quiz-card {
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 15px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
}

.quiz-card:hover {
    border-color: #667eea;
    background: #f0f4ff;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.1);
}

.quiz-card.selected {
    border-color: #667eea;
    background: #667eea;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.quiz-card-name {
    font-size: 1.2em;
    font-weight: bold;
    margin-bottom: 8px;
}

.quiz-card-description {
    font-size: 0.9em;
    opacity: 0.8;
}

.divider {
    text-align: center;
    position: relative;
    margin: 25px 0;
}

.divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e9ecef;
}

.divider span {
    background: white;
    padding: 0 20px;
    color: #666;
    font-weight: bold;
    font-size: 0.9em;
}

/* Styles pour le tag multi */
.multi-tag {
  background: #ff9800;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75em;
  font-weight: bold;
  margin-right: 10px;
  text-transform: uppercase;
}

.validate-button-container {
  text-align: center;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
}

.btn-validate {
  background: #4caf50;
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1.2em;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  min-width: 200px;
}

.btn-validate:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

.btn-validate:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsive design pour mobile */
@media (max-width: 768px) {
    body {
        padding: 10px;
        min-height: 100vh;
        display: flex;
        align-items: flex-start;
    }

    .container {
        padding: 20px 15px;
        margin: 0;
        border-radius: 15px;
        max-width: 100%;
        flex-direction: column;
        gap: 0;
    }

    .main-content {
        flex: none;
    }

    .question-tracker {
        display: none !important;
    }

    .tracker-grid.two-columns {
        grid-template-columns: 1fr;
    }

    .header {
        margin-bottom: 15px;
    }

    .title {
        font-size: 2em;
        margin-bottom: 5px;
    }

    .subtitle {
        font-size: 1em;
    }

    .progress {
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 8px;
    }

    .progress-item {
        padding: 10px;
        border-radius: 8px;
    }

    .progress-number {
        font-size: 1.5em;
    }

    .timer-progress {
        margin-bottom: 15px;
        height: 6px;
    }

    .question-card {
        padding: 20px 15px;
        margin-bottom: 15px;
        border-radius: 12px;
    }

    .question-text {
        font-size: 1.1em;
        margin-bottom: 15px;
    }

    .options {
        gap: 10px;
    }

    .option {
        padding: 12px 15px;
        border-radius: 8px;
        font-size: 1em;
    }

    .buttons {
        gap: 10px;
        flex-direction: column;
    }

    .btn {
        padding: 12px 25px;
        font-size: 1em;
        border-radius: 8px;
        width: 100%;
    }

    .predefined-quizzes {
        margin-bottom: 20px;
    }

    .quiz-list {
        gap: 10px;
        margin-bottom: 15px;
    }

    .quiz-card {
        padding: 15px;
        border-radius: 12px;
    }

    .quiz-card-name {
        font-size: 1.1em;
        margin-bottom: 5px;
    }

    .quiz-card-description {
        font-size: 0.85em;
    }

    .file-input {
        margin-bottom: 20px;
    }

    .file-label {
        padding: 12px 25px;
        border-radius: 8px;
        font-size: 1em;
        width: 100%;
        text-align: center;
        display: block;
    }

    .final-score {
        padding: 25px 15px;
        border-radius: 15px;
        margin-top: 15px;
    }

    .final-score h2 {
        font-size: 2em;
        margin-bottom: 10px;
    }

    .final-score p {
        font-size: 1.1em;
        margin-bottom: 8px;
    }

    .modal {
        padding: 25px 15px;
        border-radius: 15px;
        width: 95%;
    }

    .modal-result-icon {
        font-size: 3em;
        margin-bottom: 15px;
    }

    .modal-result-title {
        font-size: 1.5em;
        margin-bottom: 15px;
    }

    .modal-result-message {
        font-size: 1em;
        margin-bottom: 15px;
    }

    .modal-explanation {
        padding: 15px;
        margin: 15px 0;
        border-radius: 12px;
    }

    .modal-button-container {
        margin-top: 20px;
    }

    .modal-button-container .btn {
        font-size: 1em;
        padding: 12px 25px;
        min-width: auto;
        width: 100%;
    }

    .toast {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
        transform: translateY(-100px);
    }

    .toast.show {
        transform: translateY(0);
    }
}
</style>