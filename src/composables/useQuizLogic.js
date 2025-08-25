import { ref, computed, nextTick } from 'vue'

export function useQuizLogic() {
  // State
  const questions = ref([])
  const currentPool = ref([])
  const seenQuestions = ref(new Set())
  const correctAnswers = ref(0)
  const currentStreak = ref(0)
  const targetCorrect = ref(25)
  const currentQuestion = ref(null)
  const selectedAnswer = ref(null)
  const availableQuizzes = ref([])
  const selectedQuiz = ref(null)
  const currentQuizKey = ref(null)
  const isTestMode = ref(false)
  const testQuestions = ref([])
  const currentTestIndex = ref(0)
  const questionResults = ref([])
  const answeredQuestions = ref([])
  const failedQuestions = ref([])
  const allAttemptedQuestions = ref([])
  const wrongAnswersFirstTry = ref([])
  const currentView = ref('upload')
  const isLoading = ref(false)
  const isLoadingQuizzes = ref(true)
  const showModal = ref(false)
  const showResults = ref(false)
  const shuffledOptions = ref([])
  const isProcessingAnswer = ref(false)

  // Modal state
  const modalIcon = ref('')
  const modalTitle = ref('')
  const modalMessage = ref('')
  const modalTitleClass = ref('')

  // Computed
  const displayScore = computed(() => {
    if (isTestMode.value) {
      return `${currentTestIndex.value} / 10`
    }
    return `${correctAnswers.value} / ${targetCorrect.value}`
  })

  const isQuizStarted = computed(() => {
    return currentView.value === 'quiz'
  })

  const questionText = computed(() => {
    if (!currentQuestion.value) return ''
    
    if (window.innerWidth > 768) {
      const questionId = getQuestionDisplayId(currentQuestion.value)
      return `Question ${questionId}: ${currentQuestion.value.question}`
    }
    return currentQuestion.value.question
  })

  const trackerCircles = computed(() => {
    const numQuestions = isTestMode.value ? 10 : targetCorrect.value
    return new Array(numQuestions).fill(null).map((_, index) => {
      if (isTestMode.value) {
        return questionResults.value[index] || null
      } else {
        return allAttemptedQuestions.value[index] || null
      }
    })
  })

  const needTwoColumns = computed(() => {
    const numQuestions = isTestMode.value ? 10 : 25
    const circleHeight = 55
    const availableHeight = window.innerHeight - 200
    const maxCirclesInOneColumn = Math.floor(availableHeight / circleHeight)
    return numQuestions > maxCirclesInOneColumn
  })

  const resultEmoji = computed(() => {
    if (!isTestMode.value) return '🏆'
    
    const note = correctAnswers.value
    if (note >= 8) return '🏆'
    if (note >= 6) return '👏'
    if (note >= 4) return '📚'
    return '💪'
  })

  const resultTitle = computed(() => {
    if (!isTestMode.value) return 'Félicitations !'
    return 'Test terminé !'
  })

  const testPercentage = computed(() => {
    if (!isTestMode.value) return 0
    return (correctAnswers.value / 10 * 100).toFixed(0)
  })

  const testMessage = computed(() => {
    if (!isTestMode.value) return ''
    
    const note = correctAnswers.value
    if (note >= 8) return 'Excellente maîtrise du sujet !'
    if (note >= 6) return 'Bonne compréhension, continuez vos efforts !'
    if (note >= 4) return 'C\'est un début, il faut réviser !'
    return 'Il faut revoir les bases !'
  })

  // Methods
  const shuffleArray = (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const getQuestionId = (question) => {
    return question.id || `q_${question.question.substring(0, 50).replace(/\s+/g, '_')}`
  }

  const getQuestionDisplayId = (question) => {
    if (question.id) {
      return question.id.toString()
    }
    const questionText = question.question || ''
    return questionText.substring(0, 3).toUpperCase()
  }

  const getSeenQuestionsFromStorage = (quizKey) => {
    try {
      const stored = localStorage.getItem(`quiz_seen_${quizKey}`)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Erreur lors de la lecture du localStorage:', error)
      return []
    }
  }

  const saveSeenQuestionsToStorage = (quizKey, seenQuestionIds) => {
    try {
      localStorage.setItem(`quiz_seen_${quizKey}`, JSON.stringify(seenQuestionIds))
    } catch (error) {
      console.warn('Erreur lors de l\'écriture dans localStorage:', error)
    }
  }

  const clearSeenQuestionsFromStorage = (quizKey) => {
    try {
      localStorage.removeItem(`quiz_seen_${quizKey}`)
    } catch (error) {
      console.warn('Erreur lors de la suppression du localStorage:', error)
    }
  }

  const getAllSeenQuestions = () => {
    const storedSeenQuestions = currentQuizKey.value ? 
      getSeenQuestionsFromStorage(currentQuizKey.value) : []
    const sessionSeenQuestions = Array.from(seenQuestions.value)
    
    return [...new Set([...storedSeenQuestions, ...sessionSeenQuestions])]
  }

  const loadAvailableQuizzes = async () => {
    try {
      const response = await fetch('quizz.json')
      if (!response.ok) throw new Error('Impossible de charger la liste des quizz')
      
      const data = await response.json()
      availableQuizzes.value = data.quizzes || []
    } catch (error) {
      console.error('Erreur lors du chargement des quizz:', error)
      availableQuizzes.value = []
    } finally {
      isLoadingQuizzes.value = false
    }
  }

  const selectQuiz = async (quiz) => {
    // Nettoyer complètement l'état précédent
    seenQuestions.value.clear()
    currentPool.value = []
    allAttemptedQuestions.value = []
    answeredQuestions.value = []
    failedQuestions.value = []
    wrongAnswersFirstTry.value = []
    correctAnswers.value = 0
    currentStreak.value = 0
    
    selectedQuiz.value = quiz
    currentQuizKey.value = quiz.file
    await loadQuizFromFile(quiz.file)
  }

  const loadQuizFromFile = async (filename) => {
    try {
      isLoading.value = true
      
      const response = await fetch(filename)
      if (!response.ok) throw new Error(`Impossible de charger le fichier ${filename}`)
      
      const data = await response.json()
      
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Le fichier doit contenir un tableau "questions"')
      }

      questions.value = data.questions
      initializePool()
      currentView.value = 'start'
    } catch (error) {
      alert('Oops ! Problème avec le fichier: ' + error.message)
      selectedQuiz.value = null
    } finally {
      isLoading.value = false
    }
  }

  const loadQuestionsFromFile = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      isLoading.value = true
      
      // Nettoyer complètement l'état précédent
      seenQuestions.value.clear()
      currentPool.value = []
      allAttemptedQuestions.value = []
      answeredQuestions.value = []
      failedQuestions.value = []
      wrongAnswersFirstTry.value = []
      correctAnswers.value = 0
      currentStreak.value = 0
      
      const text = await file.text()
      const data = JSON.parse(text)
      
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Le fichier doit contenir un tableau "questions"')
      }

      questions.value = data.questions
      currentQuizKey.value = file.name
      initializePool()
      currentView.value = 'start'
    } catch (error) {
      alert('Oops ! Problème avec le fichier: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const initializePool = () => {
    if (questions.value.length < 10) {
      alert('Il faut au moins 10 questions dans le fichier JSON.')
      return false
    }

    targetCorrect.value = Math.min(25, questions.value.length)
    
    // Récupérer les questions déjà vues pour ce quiz depuis localStorage
    const storedSeenQuestions = currentQuizKey.value ? 
      getSeenQuestionsFromStorage(currentQuizKey.value) : []
    
    // Filtrer les questions non vues pour la pool initiale
    const unseenQuestions = questions.value.filter(q => {
      const questionId = getQuestionId(q)
      return !storedSeenQuestions.includes(questionId)
    })
    
    // Si on a assez de questions non vues, les utiliser. Sinon, prendre toutes les questions.
    const questionsForPool = unseenQuestions.length >= 10 ? unseenQuestions : questions.value
    currentPool.value = shuffleArray([...questionsForPool]).slice(0, 10)
    
    return true
  }

  const startQuiz = () => {
    isTestMode.value = false
    questionResults.value = new Array(targetCorrect.value).fill(null)
    answeredQuestions.value = []
    failedQuestions.value = []
    allAttemptedQuestions.value = []
    wrongAnswersFirstTry.value = []
    correctAnswers.value = 0
    currentStreak.value = 0
    currentView.value = 'quiz'
    nextQuestion()
  }

  const startTest = () => {
    if (questions.value.length < 10) {
      alert('Il faut au moins 10 questions pour démarrer un test.')
      return
    }
    
    isTestMode.value = true
    testQuestions.value = shuffleArray([...questions.value]).slice(0, 10)
    currentTestIndex.value = 0
    correctAnswers.value = 0
    questionResults.value = new Array(10).fill(null)
    wrongAnswersFirstTry.value = []
    currentView.value = 'quiz'
    nextQuestion()
  }

  const changeFile = () => {
    // Nettoyer complètement l'état
    currentView.value = 'upload'
    selectedQuiz.value = null
    questions.value = []
    currentPool.value = []
    seenQuestions.value.clear()
    allAttemptedQuestions.value = []
    answeredQuestions.value = []
    failedQuestions.value = []
    wrongAnswersFirstTry.value = []
    correctAnswers.value = 0
    currentStreak.value = 0
    currentQuizKey.value = null
    isTestMode.value = false
    testQuestions.value = []
    currentTestIndex.value = 0
    questionResults.value = []
  }

  const nextQuestion = () => {
    if (isTestMode.value) {
      if (currentTestIndex.value >= testQuestions.value.length) {
        currentView.value = 'result'
        return
      }
      
      selectedAnswer.value = null
      showResults.value = false
      isProcessingAnswer.value = false // Reset processing flag
      currentQuestion.value = testQuestions.value[currentTestIndex.value]
      currentTestIndex.value++
      displayQuestion()
    } else {
      if (correctAnswers.value >= targetCorrect.value) {
        currentView.value = 'result'
        return
      }

      if (currentPool.value.length === 0) {
        alert('Plus de questions disponibles!')
        return
      }

      selectedAnswer.value = null
      showResults.value = false
      isProcessingAnswer.value = false // Reset processing flag
      
      const randomIndex = Math.floor(Math.random() * currentPool.value.length)
      currentQuestion.value = currentPool.value[randomIndex]
      
      // NE PAS marquer la question comme vue ici - seulement quand elle est réussie
      displayQuestion()
    }
  }

  const displayQuestion = () => {
    if (!currentQuestion.value) return

    const optionsWithIndices = currentQuestion.value.options.map((option, index) => ({
      text: option,
      originalIndex: index
    }))

    shuffledOptions.value = shuffleArray([...optionsWithIndices])
  }

  const selectAnswer = (index) => {
    if (selectedAnswer.value !== null) return

    selectedAnswer.value = index
    checkAnswer()
  }

  const checkAnswer = () => {
    // Prevent multiple simultaneous answer processing
    if (isProcessingAnswer.value) {
      return
    }
    
    isProcessingAnswer.value = true
    
    if (selectedAnswer.value === null) {
      selectedAnswer.value = -1 // Time up
    }

    showResults.value = true
    const correctIndex = currentQuestion.value.correct_answer
    const isCorrect = selectedAnswer.value === correctIndex

    if (isCorrect) {
      currentStreak.value++
      correctAnswers.value++
      
      if (isTestMode.value) {
        questionResults.value[currentTestIndex.value - 1] = true
      } else {
        updateQuestionInTracker(currentQuestion.value, 'correct')
        markQuestionAsSeen()
        removeQuestionFromPool()
        addQuestionToPool()
      }
      
      showResultModal(true, 'Excellente réponse ! 🎉')
    } else {
      currentStreak.value = 0
      
      if (isTestMode.value) {
        questionResults.value[currentTestIndex.value - 1] = false
        wrongAnswersFirstTry.value.push({
          question: currentQuestion.value,
          userAnswer: selectedAnswer.value >= 0 ? currentQuestion.value.options[selectedAnswer.value] : 'Pas de réponse (temps écoulé)',
          correctAnswer: currentQuestion.value.options[correctIndex],
          explanation: currentQuestion.value.explanation || null
        })
      } else {
        updateQuestionInTracker(currentQuestion.value, 'incorrect')
        
        const questionId = getQuestionId(currentQuestion.value)
        const alreadyFailed = wrongAnswersFirstTry.value.find(item => 
          getQuestionId(item.question) === questionId
        )
        
        if (!alreadyFailed) {
          wrongAnswersFirstTry.value.push({
            question: currentQuestion.value,
            userAnswer: selectedAnswer.value >= 0 ? currentQuestion.value.options[selectedAnswer.value] : 'Pas de réponse (temps écoulé)',
            correctAnswer: currentQuestion.value.options[correctIndex],
            explanation: currentQuestion.value.explanation || null
          })
        }
      }
      
      const message = selectedAnswer.value === -1 ? 
        `⏰ Pas de souci ! La bonne réponse était: ${currentQuestion.value.options[correctIndex]}` :
        `Presque ! La bonne réponse était: ${currentQuestion.value.options[correctIndex]}`
      showResultModal(false, message)
    }
  }

  const showResultModal = (isCorrect, message) => {
    if (isCorrect) {
      modalIcon.value = '🎉'
      modalTitle.value = 'Bonne réponse !'
      modalTitleClass.value = 'modal-result-title correct'
    } else {
      modalIcon.value = '💡'
      modalTitle.value = 'Continuez comme ça !'
      modalTitleClass.value = 'modal-result-title incorrect'
    }

    modalMessage.value = message
    showModal.value = true
  }

  const updateQuestionInTracker = (question, newStatus) => {
    const questionId = getQuestionId(question)
    
    const existingIndex = allAttemptedQuestions.value.findIndex(
      attempt => getQuestionId(attempt.question) === questionId
    )
    
    if (existingIndex !== -1) {
      const existingAttempt = allAttemptedQuestions.value[existingIndex]
      
      if (newStatus === 'correct') {
        if (existingAttempt.status === 'incorrect') {
          allAttemptedQuestions.value[existingIndex].status = 'correct-retry'
        }
      } else {
        allAttemptedQuestions.value[existingIndex].status = newStatus
      }
    } else {
      allAttemptedQuestions.value.push({
        question: question,
        status: newStatus
      })
    }
    
    answeredQuestions.value = allAttemptedQuestions.value
      .filter(attempt => attempt.status === 'correct' || attempt.status === 'correct-retry')
      .map(attempt => attempt.question)
      
    failedQuestions.value = allAttemptedQuestions.value
      .filter(attempt => attempt.status === 'incorrect')
      .map(attempt => attempt.question)
  }

  const markQuestionAsSeen = () => {
    if (!currentQuestion.value || !currentQuizKey.value) return
    
    const questionId = getQuestionId(currentQuestion.value)
    seenQuestions.value.add(questionId)
    
    const storedSeenQuestions = getSeenQuestionsFromStorage(currentQuizKey.value)
    if (!storedSeenQuestions.includes(questionId)) {
      storedSeenQuestions.push(questionId)
      saveSeenQuestionsToStorage(currentQuizKey.value, storedSeenQuestions)
    }
  }

  const removeQuestionFromPool = () => {
    const currentQuestionId = getQuestionId(currentQuestion.value)
    const index = currentPool.value.findIndex(q => getQuestionId(q) === currentQuestionId)
    if (index > -1) {
      currentPool.value.splice(index, 1)
    }
  }

  const addQuestionToPool = () => {
    // Récupérer les questions vues depuis localStorage uniquement (pas la session courante)
    const storedSeenQuestions = currentQuizKey.value ? 
      getSeenQuestionsFromStorage(currentQuizKey.value) : []
    
    const availableQuestions = questions.value.filter(q => {
      const questionId = getQuestionId(q)
      const isInPool = currentPool.value.some(poolQ => getQuestionId(poolQ) === questionId)
      const hasBeenSeenPermanently = storedSeenQuestions.includes(questionId)
      return !isInPool && !hasBeenSeenPermanently
    })
    
    if (availableQuestions.length > 0) {
      const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
      currentPool.value.push(randomQuestion)
    } else if (storedSeenQuestions.length >= questions.value.length * 0.8) {
      console.log('Réinitialisation de l\'historique des questions vues (80% du quiz vu)')
      clearSeenQuestionsFromStorage(currentQuizKey.value)
      
      // Après réinitialisation, toutes les questions sauf celles en pool sont disponibles
      const resetAvailableQuestions = questions.value.filter(q => {
        const questionId = getQuestionId(q)
        const isInPool = currentPool.value.some(poolQ => getQuestionId(poolQ) === questionId)
        return !isInPool
      })
      
      if (resetAvailableQuestions.length > 0) {
        const randomQuestion = resetAvailableQuestions[Math.floor(Math.random() * resetAvailableQuestions.length)]
        currentPool.value.push(randomQuestion)
      }
    }
  }

  const getCircleClass = (result, index) => {
    if (isTestMode.value) {
      if (result === null) return ''
      return result === true ? 'correct' : 'incorrect'
    } else {
      if (!result) return ''
      return result.status
    }
  }

  const getCircleText = (result, index) => {
    if (isTestMode.value) {
      return (index + 1).toString()
    } else {
      if (!result) return ''
      return getQuestionDisplayId(result.question)
    }
  }

  const goToNextQuestion = () => {
    closeModal()
    isProcessingAnswer.value = false // Reset the processing flag
    nextTick(() => {
      nextQuestion()
    })
  }

  const closeModal = () => {
    showModal.value = false
  }

  const resetQuestionHistory = () => {
    if (!currentQuizKey.value) {
      alert('Aucun quiz sélectionné')
      return
    }
    
    if (confirm('Êtes-vous sûr de vouloir réinitialiser l\'historique des questions vues pour ce quiz ?')) {
      clearSeenQuestionsFromStorage(currentQuizKey.value)
      seenQuestions.value.clear()
      alert('Historique des questions réinitialisé ! Toutes les questions redeviendront disponibles.')
    }
  }

  const restart = () => {
    correctAnswers.value = 0
    currentStreak.value = 0
    currentPool.value = []
    seenQuestions.value.clear()
    questions.value = []
    currentQuizKey.value = null
    isTestMode.value = false
    testQuestions.value = []
    currentTestIndex.value = 0
    questionResults.value = []
    answeredQuestions.value = []
    failedQuestions.value = []
    allAttemptedQuestions.value = []
    wrongAnswersFirstTry.value = []
    selectedQuiz.value = null
    currentView.value = 'upload'
  }

  const showWrongAnswers = () => {
    if (wrongAnswersFirstTry.value.length === 0) {
      alert('Aucune question ratée à afficher !')
      return
    }
    currentView.value = 'wrongAnswers'
  }

  const backToResults = () => {
    currentView.value = 'result'
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
    isProcessingAnswer,
    
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
    testMessage
  }
}