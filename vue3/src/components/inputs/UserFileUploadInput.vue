<template>
    <div>
        <v-text-field :label="$t('Name')" v-model="name"></v-text-field>
        <v-file-input
            :label="$t('File')"
            v-model="file"
            accept=".pdf,.docx,.xlsx,.css,.mp4,.mov,.png,.jpg,.jpeg,.gif,.webp"
            hint="Allowed file types: PDF, DOCX, XLSX, CSS, MP4, MOV, PNG, JPG, JPEG, GIF, WEBP"
            persistent-hint
        ></v-file-input>
    </div>
</template>

<script setup lang="ts">
import {watch} from "vue";

const name = defineModel<string>('name')
const file = defineModel<File | null>('file')

watch(file, (selectedFile) => {
    if (selectedFile && !name.value) {
        name.value = selectedFile.name
    }
})
</script>
