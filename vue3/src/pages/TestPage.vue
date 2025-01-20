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

    <template v-if="false">
        <v-divider></v-divider>

        <v-row class="mt-5">
            <v-col>
                <v-text-field density="compact"></v-text-field>

            </v-col>
            <v-col>
                <model-select model="Food" density="compact"></model-select>

            </v-col>
        </v-row>
        <v-row class="mt-5">
            <v-col>

                <v-text-field density="comfortable"></v-text-field>

            </v-col>
            <v-col>

                <model-select model="Food" density="comfortable"></model-select>

            </v-col>
        </v-row>
        <v-row class="mt-5">
            <v-col>
                <model-select model="Food"></model-select>
                <v-text-field></v-text-field>
            </v-col>
            <v-col>

                <model-select model="Food"></model-select>
            </v-col>
        </v-row>

    </template>


</template>

<script setup lang="ts">


import {ApiApi, MealPlan} from "@/openapi";
import {ref, useTemplateRef} from "vue";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {DateTime} from "luxon";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {VueDraggable} from "vue-draggable-plus";
import {useFileApi} from "@/composables/useFileApi";

const {convertImageToRecipe, fileApiLoading} = useFileApi()

const image = ref<null|File>(null)
const response = ref('')

const dialog = ref(false)
const activator = useTemplateRef<Element>('dialogOpenerRef')

const defaultItem = ref({
    fromDate: DateTime.now().plus({day: 2}).toJSDate()
} as MealPlan)


function imageToRecipe() {
    if(image.value != null){
        convertImageToRecipe(image.value)
    }
}


</script>


<style scoped>

</style>