<template>
    <div>
        <button
            class="text-overline px-4 pt-3 d-block w-100 text-start"
            style="cursor: pointer; user-select: none; appearance: none; border: none; background: none; padding-bottom: 0;"
            :aria-expanded="isOpen"
            @click="isOpen = !isOpen"
        >
            {{ label }}
        </button>
        <v-expand-transition>
            <div v-show="isOpen">
                <slot />
            </div>
        </v-expand-transition>
    </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const props = withDefaults(defineProps<{
    label: string
    defaultOpen?: boolean
}>(), {
    defaultOpen: true,
})

const isOpen = ref(props.defaultOpen)
</script>
