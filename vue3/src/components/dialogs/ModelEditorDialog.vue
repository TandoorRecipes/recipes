<template>
    <v-dialog max-width="600" activator="parent">
        <template  v-slot:default="{ isActive }">
            <slot name="default"></slot>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>