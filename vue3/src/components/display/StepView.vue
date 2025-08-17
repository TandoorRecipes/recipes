<template>
    <v-card>
        <v-card-title>
            <v-row>
                <v-col>
                    <span v-if="step.name">{{ step.name }}</span>
                    <span v-else-if="step.stepRecipe"><v-icon icon="$recipes"></v-icon> {{ step.stepRecipeData.name }}</span>
                    <span v-else>{{ $t('Step') }} {{ props.stepNumber }}</span>
                </v-col>
                <v-col class="text-right">
                    <v-btn-group density="compact" variant="tonal" class="d-print-none">
                        <v-btn size="small" color="info" v-if="step.time != undefined && step.time > 0" @click="timerRunning = true"><i
                            class="fas fa-stopwatch mr-1 fa-fw"></i> {{ step.time }}
                        </v-btn>
                        <v-btn size="small" color="success" v-if="hasDetails" @click="stepChecked = !stepChecked"><i class="fas fa-fw"
                                                                                                                     :class="{'fa-check': !stepChecked, 'fa-times': stepChecked}"></i>
                        </v-btn>
                    </v-btn-group>
                </v-col>
            </v-row>
        </v-card-title>
        <template v-if="!stepChecked">
            <timer :seconds="step.time != undefined ? step.time*60 : 0" @stop="timerRunning = false" v-if="timerRunning"></timer>
            <v-card-text v-if="step.ingredients.length > 0 || step.instruction != ''">
                <v-row>
                    <v-col cols="12" md="6" v-if="step.ingredients.length > 0 && step.showIngredientsTable">
                        <ingredients-table v-model="step.ingredients" :ingredient-factor="ingredientFactor"></ingredients-table>
                    </v-col>
                    <v-col cols="12" md="6" class="markdown-body">
                        <instructions :instructions_html="step.instructionsMarkdown" :ingredient_factor="ingredientFactor" v-if="step.instructionsMarkdown != undefined"></instructions>
                        <!-- sub recipes dont have a correct schema, thus they use different variable naming -->
                        <instructions :instructions_html="step.instructions_markdown" :ingredient_factor="ingredientFactor" v-else></instructions>
                    </v-col>
                </v-row>
            </v-card-text>

            <template v-if="step.stepRecipe">
                <v-card  class="ma-2 border-md" prepend-icon="$recipes" :title="step.stepRecipeData.name">
                    <v-card-text class="mt-1" v-for="(subRecipeStep, subRecipeStepIndex) in step.stepRecipeData.steps" :key="subRecipeStep.id">
                        <step-view v-model="step.stepRecipeData.steps[subRecipeStepIndex]" :step-number="subRecipeStepIndex+1" :ingredientFactor="ingredientFactor"></step-view>
                    </v-card-text>
                </v-card>
            </template>
            <template v-if="step.file">
                <v-img :src="step.file.preview" v-if="step.file.preview"></v-img>
                <a :href="step.file.fileDownload" v-else>{{ $t('Download') }}</a>
            </template>
        </template>

    </v-card>
</template>

<script setup lang="ts">
import {computed, defineComponent, PropType, ref} from 'vue'
import IngredientsTable from "@/components/display/IngredientsTable.vue";
import {Step} from "@/openapi";

import Instructions from "@/components/display/Instructions.vue";
import Timer from "@/components/display/Timer.vue";

const step = defineModel<Step>({required: true})

const props = defineProps({
    stepNumber: {
        type: Number,
        required: false,
        default: 1
    },
    ingredientFactor: {
        type: Number,
        required: true,
    },
})

const timerRunning = ref(false)
const stepChecked = ref(false)

const hasDetails = computed(() => {
    return step.value.ingredients.length > 0 || (step.value.instruction != undefined && step.value.instruction.length > 0) || step.value.stepRecipeData != undefined || step.value.file != undefined
})

</script>

<style scoped>

</style>