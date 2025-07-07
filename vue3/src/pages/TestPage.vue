<template>
    <v-container>
        Form
        <v-form>
            <ModelSelect model="Food"></ModelSelect>
        </v-form>

        Non Form
        <ModelSelect model="Food"></ModelSelect>


        <v-text-field :label="$t('Name')" :max-length="128" counter></v-text-field>
        <v-number-input :label="$t('Servings')" :precision="2"></v-number-input>
        <v-text-field :label="$t('ServingsText')" :max-length="32" counter></v-text-field>
<v-form>

    <v-text-field :rules="['required', ['maxLength', 16]]" label="Email" />
</v-form>
    </v-container>
</template>

<script setup lang="ts">

import ModelSelect from "@/components/inputs/ModelSelect.vue";

</script>


<style scoped>

</style>