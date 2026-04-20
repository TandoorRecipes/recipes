import {ref} from 'vue'

const isOpen = ref(false)
const isPinned = ref(false)

export function useRecipeViewSettings() {
    return {isOpen, isPinned}
}
