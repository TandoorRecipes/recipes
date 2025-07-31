<template>
    <v-input label="Test" hint="Test hint" persistent-hint>
        <template #prepend v-if="$slots.prepend">
            <slot name="prepend">
            </slot>
        </template>

        <v-rating v-model="model"></v-rating>

         <template #append v-if="$slots.append">
            <slot name="append">
            </slot>
        </template>
    </v-input>
</template>

<script setup lang="ts">

const model = defineModel<boolean>({required: true})

</script>


<style scoped>

</style>