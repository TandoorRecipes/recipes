<template>
    <v-form>
        <p class="text-h6">{{ useUserPreferenceStore().activeSpace.name }}</p>
        <v-divider class="mb-3"></v-divider>

        <space-editor :item-id="useUserPreferenceStore().activeSpace.id!"></space-editor>
    </v-form>
</template>


<script setup lang="ts">


import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import SpaceLimitsInfo from "@/components/display/SpaceLimitsInfo.vue";
import SpaceEditor from "@/components/model_editors/SpaceEditor.vue";
</script>

<style scoped>

</style>