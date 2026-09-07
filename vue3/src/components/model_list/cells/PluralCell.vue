<template>
    {{obj.name}} <i v-if="obj.pluralName && obj.name != obj.pluralName">({{obj.pluralName}})</i>
</template>

<script setup lang="ts">

type PluralizedObj = {
    name: string,
    pluralName?: string
}

const obj = defineModel<any>({required: true})
</script>

<style scoped>

</style>