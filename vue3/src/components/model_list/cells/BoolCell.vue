<template>
    <v-chip label v-if="obj" color="success" prepend-icon="fa-solid fa-check">{{ $t('Yes') }}</v-chip>
    <v-chip label v-else color="warning" prepend-icon="fa-solid fa-xmark">{{ $t('No') }}</v-chip>
</template>

<script setup lang="ts">

const obj = defineModel<Boolean>({required: true})
</script>

<style scoped>

</style>