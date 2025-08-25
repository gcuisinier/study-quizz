import { ref } from 'vue'

export function useAudio() {
  const audioContext = ref(null)

  const initAudioContext = () => {
    try {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    } catch (error) {
      console.warn('Audio context non supporté:', error)
    }
  }

  const playSuccessSound = () => {
    if (!audioContext.value) {
      initAudioContext()
    }

    if (!audioContext.value) return

    if (audioContext.value.state === 'suspended') {
      audioContext.value.resume()
    }

    try {
      const oscillator = audioContext.value.createOscillator()
      const gainNode = audioContext.value.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.value.destination)
      
      const notes = [523.25, 659.25, 783.99] // C5, E5, G5
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(notes[0], audioContext.value.currentTime)
      
      gainNode.gain.setValueAtTime(0, audioContext.value.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.value.currentTime + 0.05)
      
      const noteTime = 0.15
      notes.forEach((note, index) => {
        const startTime = audioContext.value.currentTime + (index * noteTime)
        oscillator.frequency.setValueAtTime(note, startTime)
      })
      
      gainNode.gain.setValueAtTime(0.1, audioContext.value.currentTime + (notes.length * noteTime) - 0.05)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.value.currentTime + (notes.length * noteTime))
      
      oscillator.start(audioContext.value.currentTime)
      oscillator.stop(audioContext.value.currentTime + (notes.length * noteTime))
      
    } catch (error) {
      console.warn('Erreur lors de la lecture du son:', error)
    }
  }

  // Initialize on first use
  if (!audioContext.value) {
    initAudioContext()
  }

  return {
    playSuccessSound
  }
}