<template>
    <v-icon :icon="icon"></v-icon>
</template>

<script setup lang="ts">
import {computed} from "vue";

const icon = computed(() => {
    let icons = [
        'fa-solid fa-fw fa-hamburger',
        'fa-solid fa-fw fa-utensils',
        'fa-solid fa-fw fa-apple-alt',
        'fa-solid fa-fw fa-bacon',
        'fa-solid fa-fw fa-bread-slice',
        'fa-solid fa-fw fa-candy-cane',
        'fa-solid fa-fw fa-carrot',
        'fa-solid fa-fw fa-cheese',
        'fa-solid fa-fw fa-cookie',
        'fa-solid fa-fw fa-drumstick-bite',
        'fa-solid fa-fw fa-egg',
        'fa-solid fa-fw fa-fish',
        'fa-solid fa-fw fa-hotdog',
        'fa-solid fa-fw fa-ice-cream',
        'fa-solid fa-fw fa-lemon',
        'fa-solid fa-fw fa-pepper-hot',
        'fa-solid fa-fw fa-pizza-slice',
        'fa-solid fa-fw fa-cookie-bite'

    ]

    return icons[Math.floor(Math.random() * icons.length)];
})
</script>

<style scoped>

</style>