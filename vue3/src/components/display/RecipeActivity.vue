<template>
    <v-card class="mt-1" v-if="useUserPreferenceStore().isAuthenticated && !useUserPreferenceStore().isPrintMode" :loading="loading">
        <v-card-text>
            <!-- Recommendation Weight -->
            <v-row dense class="mb-2">
                <v-col cols="12" md="6">
                    <v-label class="font-weight-bold">{{ $t('Recommendation Weight') }}</v-label>
                    <div class="text-caption text-disabled mb-2">{{ $t('How much do you recommend this recipe?') }}</div>
                    <v-slider
                        v-model="userWeight"
                        min="-1"
                        max="1"
                        step="0.1"
                        thumb-label="always"
                        show-ticks="always"
                        tick-size="2"
                        :color="weightColor"
                        @update:model-value="saveUserWeight"
                    ></v-slider>
                    <div class="text-center text-caption">
                        <span class="text-negative" v-if="userWeight < 0">{{ $t('Avoid') }}</span>
                        <span v-else-if="userWeight == 0">{{ $t('Neutral') }}</span>
                        <span class="text-positive" v-if="userWeight > 0">{{ $t('Recommended') }}</span>
                    </div>
                </v-col>
                <v-col cols="12" md="6">
                    <v-label>{{ $t('Rating') }}</v-label>
                    <br/>
                    <v-rating v-model="newCookLog.rating" clearable hover density="compact"></v-rating>
                </v-col>
            </v-row>
            <v-row dense>
                <v-col cols="12" md="4">
                    <v-number-input :label="$t('Servings')" v-model="newCookLog.servings" :precision="2"></v-number-input>
                </v-col>
                <v-col cols="12" md="4">
                    <v-date-input :label="$t('Date')" v-model="newCookLog.createdAt"></v-date-input>
                </v-col>
                <v-col cols="12" md="4">
                    <v-textarea :label="$t('Comment')" rows="2" v-model="newCookLog.comment" auto-grow></v-textarea>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions>
            <v-btn color="create" prepend-icon="$create" @click="saveCookLog()">{{ $t('Create') }}</v-btn>
        </v-card-actions>
    </v-card>

    <v-card class="mt-1" v-if="cookLogs.length > 0" :loading="loading">
        <v-card-title>{{ $t('Activity') }}</v-card-title>
        <v-card-text>
            <v-list>
                <v-list-item class="border-t-sm" v-for="c in cookLogs" :key="c.id" :link="c.createdBy.id == useUserPreferenceStore().userSettings?.user.id">
                    <template #prepend>
                        <v-avatar color="primary">{{ c.createdBy.displayName.charAt(0) }}</v-avatar>
                    </template>
                    <v-list-item-title class="font-weight-bold">
                        {{ c.createdBy.displayName }}
                    </v-list-item-title>
                    <span>{{ c.comment }}</span>

                    <v-list-item-subtitle class="font-italic mt-1" v-if="c.servings != null && c.servings > 0">

                        {{ c.servings }}
                        <span v-if="recipe.servingsText != ''">{{ recipe.servingsText }}</span>
                        <span v-else-if="c.servings == 1">{{ $t('Serving') }}</span>
                        <span v-else>{{ $t('Servings') }}</span>

                    </v-list-item-subtitle>

                    <template #append>
                        <v-list-item-action class="flex-column align-end">
                            <v-rating density="comfortable" size="x-small" color="tandoor" v-model="c.rating" half-increments readonly
                                      v-if="c.rating != undefined" style="overflow: hidden"></v-rating>
                            <v-spacer></v-spacer>
                            <v-tooltip location="top" :text="DateTime.fromJSDate(c.createdAt).toLocaleString(DateTime.DATETIME_MED)" v-if="c.createdAt != undefined">
                                <template v-slot:activator="{ props }">
                                    <span v-bind="props">{{ DateTime.fromJSDate(c.createdAt).toRelative({style: 'narrow'}) }}</span>
                                </template>
                            </v-tooltip>

                        </v-list-item-action>
                    </template>
                    <model-edit-dialog model="CookLog" :item="c" v-if="c.createdBy.id == useUserPreferenceStore().userSettings?.user.id" @save="recLoadCookLog(props.recipe.id)" @delete="recLoadCookLog(props.recipe.id)"></model-edit-dialog>
                </v-list-item>
            </v-list>
        </v-card-text>
    </v-card>


</template>

<script setup lang="ts">

import {computed, onMounted, PropType, ref, watch} from "vue";
import {ApiApi, CookLog, Recipe, RecipeUserWeight} from "@/openapi";
import {DateTime} from "luxon";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {VDateInput} from 'vuetify/labs/VDateInput'
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true
    },
    servings: {
        type: Number,
        required: true
    }
})

const newCookLog = ref({} as CookLog);
const userWeight = ref<number>(0)
const weightLoading = ref(false)

const cookLogs = ref([] as CookLog[])
const loading = ref(false)

const weightColor = computed(() => {
    if (userWeight.value < 0) return 'error'
    if (userWeight.value > 0) return 'success'
    return 'primary'
})

onMounted(() => {
    recLoadCookLog(props.recipe.id)
    loadUserWeight()
    resetForm()
})

/**
 * recursively load cook logs from database for given recipe
 */
function recLoadCookLog(recipeId: number, page: number = 1) {
    const api = new ApiApi()
    loading.value = true
    if(page == 1){
        cookLogs.value = []
    }
    api.apiCookLogList({recipe: props.recipe.id, page: page}).then(r => {
        if (r.results) {
            cookLogs.value = cookLogs.value.concat(r.results)
            if (r.next) {
                recLoadCookLog(recipeId, page + 1)
            } else {
                cookLogs.value = cookLogs.value.sort((a, b) => a.createdAt! > b.createdAt! ? 1 : -1)
                loading.value = false
            }
        }
    })
}

/**
 * reset new cook log from with proper defaults
 */
function resetForm() {
    newCookLog.value = {} as CookLog
    newCookLog.value.servings = props.servings
    newCookLog.value.createdAt = new Date()
    newCookLog.value.recipe = props.recipe.id!
}

/**
 * create new cook log in database
 */
function saveCookLog() {
    const api = new ApiApi()

    api.apiCookLogCreate({cookLog: newCookLog.value}).then(r => {
        cookLogs.value.push(r)
        resetForm()
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })
}

/**
 * watch for changes in servings prop and update the servings input field
 */
watch(() => props.servings, (newVal) => {
    newCookLog.value.servings = newVal
})

/**
 * Load the user's weight for this recipe
 */
function loadUserWeight() {
    weightLoading.value = true
    const api = new ApiApi()

    api.apiRecipeUserWeightList({recipe: props.recipe.id}).then(data => {
        if (data.results && data.results.length > 0) {
            userWeight.value = data.results[0].weight
        } else {
            userWeight.value = 0
        }
    }).catch(err => {
        console.error('Failed to load user weight:', err)
        userWeight.value = 0
    }).finally(() => {
        weightLoading.value = false
    })
}

/**
 * Save the user's weight for this recipe
 */
function saveUserWeight() {
    const api = new ApiApi()

    // First check if a weight entry already exists
    api.apiRecipeUserWeightList({recipe: props.recipe.id}).then(data => {
        if (data.results && data.results.length > 0) {
            // Update existing entry
            const existingEntry = data.results[0]
            return api.apiRecipeUserWeightPartialUpdate({
                id: existingEntry.id!,
                patchedRecipeUserWeight: { weight: userWeight.value }
            })
        } else {
            // Create new entry
            return api.apiRecipeUserWeightCreate({
                recipeUserWeight: {
                    recipe: props.recipe.id!,
                    weight: userWeight.value
                } as Omit<RecipeUserWeight, 'createdBy'|'updatedAt'>
            })
        }
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })
}

</script>

<style scoped>
.text-positive {
    color: rgb(var(--v-theme-success));
}

.text-negative {
    color: rgb(var(--v-theme-error));
}
</style>