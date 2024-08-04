<template>
    <v-form>
        <p class="text-h6">{{ $t('Cosmetic') }}</p>
        <v-divider class="mb-3"></v-divider>


        <v-btn class="mt-3" color="success" @click="useUserPreferenceStore().updateUserSettings()" prepend-icon="$save">{{$t('Save')}}</v-btn>
    </v-form>
</template>


<script setup lang="ts">



import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
</script>

<style scoped>

</style>