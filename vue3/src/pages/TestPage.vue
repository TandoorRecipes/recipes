<template>
    <v-file-input label="File input" v-model="image"></v-file-input>
    <v-btn @click="imageToRecipe()">Upload</v-btn>
    <v-textarea v-model="response"></v-textarea>

    <hr class="mt-4">
    <v-btn ref="dialogOpenerRef">REF</v-btn>
    <v-btn @click="dialog = !dialog">model</v-btn>

    <v-btn>
        direct
        <model-edit-dialog model="MealPlan" v-model="dialog" :item="defaultItem" :activator="activator"></model-edit-dialog>
    </v-btn>

</template>

<script setup lang="ts">


import {ApiApi, MealPlan} from "@/openapi";
import {ref, useTemplateRef} from "vue";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {DateTime} from "luxon";

const image = ref(File)
const response = ref('')

const dialog = ref(false)
const activator = useTemplateRef<Element>('dialogOpenerRef')

const defaultItem = ref({
    fromDate: DateTime.now().plus({day: 2}).toJSDate()
} as MealPlan)


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