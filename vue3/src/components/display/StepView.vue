<template>
    <v-card>
        <v-card-title>
            <v-row>
                <v-col>
                    <span v-if="step.name">{{ step.name }}</span>
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
            <template v-if="step.files?.length">
                <div class="d-flex flex-wrap ga-2 ma-2">
                    <template v-for="(f, idx) in step.files" :key="f.id ?? idx">
                        <crop-image v-if="f.preview"
                                    class="cursor-pointer rounded" role="button"
                                    :src="f.preview"
                                    :crop-data="f.cropData"
                                    width="96px" height="96px"
                                    force-crop
                                    :aria-label="$t('ViewFullImage')"
                                    @click="openStepImageLightbox(stepImageFiles.indexOf(f))" />
                        <a v-else :href="f.fileUrl || f.fileDownload" target="_blank" rel="noopener"
                           class="step-file-tile rounded text-decoration-none d-flex flex-column align-center justify-center text-center pa-2"
                           :title="f.name">
                            <v-icon :icon="fileIconFor(f.name)" size="x-large" />
                            <span class="text-caption text-truncate mt-1 w-100">{{ f.name }}</span>
                        </a>
                    </template>
                </div>
                <image-lightbox v-model="stepImageLightbox" :images="stepImageUrls" :start-index="stepLightboxIndex" />
            </template>
            <timer :seconds="step.time != undefined ? step.time*60 : 0" @stop="timerRunning = false" v-if="timerRunning"></timer>
            <v-card-text v-if="step.ingredients.length > 0 || step.instruction != ''">
                <v-row>
                    <v-col :cols="(useUserPreferenceStore().isPrintMode) ? 6 : 12" md="6" v-if="step.ingredients.length > 0 && (step.showIngredientsTable || step.show_ingredients_table)">
                        <ingredients-table v-model="step.ingredients" :ingredient-factor="ingredientFactor"
                                           :show-actions="showStepActions"
                                           :show-checkbox="useUserPreferenceStore().deviceSettings.recipe_showCheckboxes"
                                           @scale="(factor: number) => emit('scale', factor)"></ingredients-table>
                    </v-col>
                    <v-col :cols="(useUserPreferenceStore().isPrintMode) ? 6 : 12" md="6" class="markdown-body">
                        <instructions :instructions_html="step.instructionsMarkdown" :ingredient_factor="ingredientFactor"
                                      v-if="step.instructionsMarkdown != undefined"></instructions>
                        <!-- sub recipes dont have a correct schema, thus they use different variable naming -->
                        <instructions :instructions_html="step.instructions_markdown" :ingredient_factor="ingredientFactor" v-else></instructions>
                    </v-col>
                </v-row>
            </v-card-text>

            <template v-if="step.stepRecipe">
                <v-card class="ma-2 border-md">
                    <v-card-title>
                        <v-icon icon="$recipes"></v-icon>
                        {{ step.stepRecipeData.name }}
                        <v-btn icon="fa-solid fa-up-right-from-square" size="x-small" :to="{name: 'RecipeViewPage', params: {id: step.stepRecipeData.id}}" target="_blank" variant="plain"></v-btn>
                    </v-card-title>
                    <v-card-text class="mt-1" v-for="(subRecipeStep, subRecipeStepIndex) in step.stepRecipeData.steps" :key="subRecipeStep.id">
                        <step-view v-model="step.stepRecipeData.steps[subRecipeStepIndex]" :step-number="subRecipeStepIndex+1" :ingredientFactor="ingredientFactor"></step-view>
                    </v-card-text>
                </v-card>
            </template>
        </template>

    </v-card>
</template>

<script setup lang="ts">
import {computed, PropType, ref} from 'vue'
import {Step} from "@/openapi"
import IngredientsTable from "@/components/display/IngredientsTable.vue"
import Instructions from "@/components/display/Instructions.vue"
import Timer from "@/components/display/Timer.vue"
import ImageLightbox from "@/components/display/ImageLightbox.vue"
import CropImage from "@/components/display/CropImage.vue"
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts"

const stepImageLightbox = ref(false)
const stepLightboxIndex = ref(0)

const emit = defineEmits(['scale'])

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

const showStepActions = computed(() => useUserPreferenceStore().deviceSettings.recipe_showIngredientActions)

const timerRunning = ref(false)
const stepChecked = ref(false)

const hasDetails = computed(() => {
    return step.value.ingredients.length > 0 || (step.value.instruction != undefined && step.value.instruction.length > 0) || step.value.stepRecipeData != undefined || (step.value.files && step.value.files.length > 0)
})

const stepImageFiles = computed(() => (step.value.files ?? []).filter(f => !!f.preview))
const stepImageUrls = computed(() => stepImageFiles.value.map(f => f.preview!))

function openStepImageLightbox(idx: number) {
    if (idx < 0) return
    stepLightboxIndex.value = idx
    stepImageLightbox.value = true
}

function fileIconFor(name: string | undefined): string {
    const ext = (name ?? '').split('.').pop()?.toLowerCase() ?? ''
    switch (ext) {
        case 'pdf': return 'fa-solid fa-file-pdf'
        case 'doc': case 'docx': return 'fa-solid fa-file-word'
        case 'xls': case 'xlsx': case 'csv': return 'fa-solid fa-file-excel'
        case 'md': case 'txt': return 'fa-solid fa-file-lines'
        case 'mp4': case 'mov': case 'webm': case 'avi': return 'fa-solid fa-file-video'
        default: return 'fa-solid fa-file'
    }
}

</script>

<style scoped>
.step-file-tile {
    width: 96px;
    height: 96px;
    background-color: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    overflow: hidden;
}
.step-file-tile:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.05);
}
</style>