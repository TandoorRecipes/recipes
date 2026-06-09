import { ref, onMounted, onUnmounted } from "vue"

const isOnline = ref(typeof navigator !== "undefined" ? navigator.onLine : true)

export function useOfflineDetection() {
  const handleOnline = () => {
    isOnline.value = true
  }

  const handleOffline = () => {
    isOnline.value = false
  }

  onMounted(() => {
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener("online", handleOnline)
    window.removeEventListener("offline", handleOffline)
  })

  return {
    isOnline,
  }
}
