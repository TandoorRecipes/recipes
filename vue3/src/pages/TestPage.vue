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

    <v-divider></v-divider>

    <v-row>
        <v-col>
            <vue-draggable v-model="items1" group="test" handle=".drag-handle">

                <v-card v-for="i in items1" class="mt-1">
                    <v-card-text>
                        <v-icon icon="$dragHandle" class="drag-handle"></v-icon>
                        {{ i.name }}
                    </v-card-text>
                </v-card>

            </vue-draggable>
        </v-col>
        <v-col>
            <vue-draggable v-model="items2" group="test" handle=".drag-handle" empty-insert-threshold="25">
                <v-card v-for="i in items2" class="mt-1">
                    <v-card-text>
                        <v-icon icon="$dragHandle" class="drag-handle"></v-icon>
                        {{ i.name }}
                    </v-card-text>
                </v-card>
            </vue-draggable>
        </v-col>
    </v-row>


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

<script setup lang="ts">


import {ApiApi, MealPlan} from "@/openapi";
import {ref, useTemplateRef} from "vue";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {DateTime} from "luxon";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {VueDraggable} from "vue-draggable-plus";

const image = ref(File)
const response = ref('')

const dialog = ref(false)
const activator = useTemplateRef<Element>('dialogOpenerRef')

const defaultItem = ref({
    fromDate: DateTime.now().plus({day: 2}).toJSDate()
} as MealPlan)

const items2 = ref([])
const items1 = ref([
    {
        "name": "Jean",
        "id": "2"
    },
    {
        "name": "Johanna-2",
        "id": "3-2"
    },
    {
        "name": "Joao-2",
        "id": "1-2"
    },
    {
        "name": "Juan",
        "id": "4"
    },
    {
        "name": "Joao",
        "id": "1"
    },
    {
        "name": "Jean-2",
        "id": "2-2"
    },
    {
        "name": "Johanna",
        "id": "3"
    },
    {
        "name": "Juan-2",
        "id": "4-2"
    }
])

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