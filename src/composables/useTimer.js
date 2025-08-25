import { ref, computed } from 'vue'

export function useTimer(onTimeUp) {
  const timeLeft = ref(20)
  const timeLimit = ref(20)
  const timer = ref(null)

  const progressPercentage = computed(() => {
    return (timeLeft.value / timeLimit.value) * 100
  })

  const startTimer = () => {
    timeLeft.value = timeLimit.value
    
    if (timer.value) {
      clearInterval(timer.value)
    }
    
    timer.value = setInterval(() => {
      timeLeft.value--
      
      if (timeLeft.value <= 0) {
        clearTimer()
        onTimeUp()
      }
    }, 1000)
  }

  const clearTimer = () => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }

  return {
    timeLeft,
    timeLimit,
    progressPercentage,
    startTimer,
    clearTimer
  }
}