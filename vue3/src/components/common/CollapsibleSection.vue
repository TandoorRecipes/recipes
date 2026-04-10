<template>
    <div>
        <button
            class="text-subtitle-2 font-weight-bold text-uppercase px-4 pt-3 pb-1 d-flex align-center w-100 text-start"
            style="cursor: pointer; user-select: none; appearance: none; border: none; background: none; letter-spacing: 0.05em;"
            :aria-expanded="isOpen"
            @click="isOpen = !isOpen"
        >
            {{ label }}
            <v-spacer />
            <v-icon size="x-small" :icon="isOpen ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'" class="text-medium-emphasis" />
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
