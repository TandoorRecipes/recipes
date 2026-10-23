<template>
    <v-chip label :color="obj">{{ obj }}</v-chip>
</template>

<script setup lang="ts">

const obj = defineModel<string>({required: true})
</script>

<style scoped>

</style>