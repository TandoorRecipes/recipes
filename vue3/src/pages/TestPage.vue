<template>
    <v-file-input label="File input" v-model="image"></v-file-input>


    <v-btn @click="imageToRecipe()">Upload</v-btn>


    <v-textarea v-model="response"></v-textarea>
</template>

<script setup lang="ts">


import {ApiApi} from "@/openapi";
import {ref} from "vue";

const image = ref(File)
const response = ref('')

function imageToRecipe() {
    const api = new ApiApi()

    const reader = new FileReader()
    reader.readAsDataURL(image.value)

    api.apiImageToRecipeCreate({image: image.value}).then(r => {
        console.log(r)
        response.value = r
    }).catch(err => {
        console.log(err)
        response.value = err
    })
}


</script>


<style scoped>

</style>