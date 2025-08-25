import { ref } from 'vue'

export function useToast() {
  const toasts = ref([])
  let toastId = 0

  const showToast = (icon, title, message, className = '') => {
    const toast = {
      id: toastId++,
      icon,
      title,
      message,
      className,
      show: false
    }

    toasts.value.push(toast)

    // Animation d'apparition
    setTimeout(() => {
      const toastIndex = toasts.value.findIndex(t => t.id === toast.id)
      if (toastIndex !== -1) {
        toasts.value[toastIndex].show = true
      }
    }, 100)

    // Suppression automatique après 4 secondes
    setTimeout(() => {
      const toastIndex = toasts.value.findIndex(t => t.id === toast.id)
      if (toastIndex !== -1) {
        toasts.value[toastIndex].show = false
        
        // Supprimer complètement après l'animation
        setTimeout(() => {
          const finalIndex = toasts.value.findIndex(t => t.id === toast.id)
          if (finalIndex !== -1) {
            toasts.value.splice(finalIndex, 1)
          }
        }, 300)
      }
    }, 4000)
  }

  return {
    toasts,
    showToast
  }
}