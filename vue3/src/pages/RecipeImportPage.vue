<template>
    <v-container>
        <v-row>
            <v-col>

                <v-stepper v-model="stepper">
                    <template v-slot:default="{ prev, next }">
                        <v-stepper-header>
                            <v-stepper-item :title="$t('Import')" value="1"></v-stepper-item>
                            <v-divider></v-divider>
                            <v-stepper-item :title="$t('Image')" value="2"></v-stepper-item>
                            <v-divider></v-divider>
                            <v-stepper-item :title="$t('Keywords')" value="3"></v-stepper-item>
                            <v-divider></v-divider>
                            <v-stepper-item :title="$t('Steps')" value="4"></v-stepper-item>
                            <v-divider></v-divider>
                            <v-stepper-item :title="$t('Save')" value="5"></v-stepper-item>
                        </v-stepper-header>

                        <v-stepper-window>
                            <v-stepper-window-item value="1">
                                <v-card>
                                    <v-card-text>
                                        <v-text-field :label="$t('Website') + ' (https://...)'" @paste="nextTick(loadRecipeFromUrl())" v-model="importUrl">
                                            <template #append>
                                                <v-btn color="primary" icon="fa-solid fa-cloud-arrow-down fa-fw" @click="loadRecipeFromUrl()"></v-btn>
                                            </template>
                                        </v-text-field>

                                        <v-textarea :placeholder="$t('paste_json')"></v-textarea>

                                        <v-alert variant="tonal" v-if="importResponse.duplicates && importResponse.duplicates.length > 0">
                                            <v-alert-title>{{ $t('Duplicate') }}</v-alert-title>
                                            {{ $t('DuplicateFoundInfo') }}
                                            <v-chip-group>
                                                <v-chip :to="{name: 'view_recipe', params: {id: r.id}}" v-for="r in importResponse.duplicates" :key="r.id"> {{ r.name }}</v-chip>
                                            </v-chip-group>
                                            <v-btn color="primary" class="float-right" @click="stepper = '2'">{{ $t('Continue') }}</v-btn>
                                        </v-alert>
                                    </v-card-text>
                                </v-card>
                            </v-stepper-window-item>
                            <v-stepper-window-item value="2">
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <h2 class="text-h5">{{ $t('Selected') }}</h2>
                                        <v-img max-height="30vh" :src="importResponse.recipe.image"></v-img>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <h2 class="text-h5">{{ $t('Available') }}</h2>
                                        <v-row dense>
                                            <v-col cols="4" v-for="i in importResponse.images">
                                                <v-img max-height="10vh" cover aspect-ratio="1" :src="i" @click="importResponse.recipe.image = i"></v-img>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>

                            </v-stepper-window-item>
                            <v-stepper-window-item value="3">
                                <v-list>
                                    <v-list-item border v-for="k in importResponse.recipe.keywords" :key="k" :class="{'bg-success': k.importKeyword}"
                                                 @click="k.importKeyword = !k.importKeyword">
                                        {{ k.label }}
                                        <template #append>
                                            <v-checkbox-btn :model-value="k.importKeyword"></v-checkbox-btn>
                                        </template>
                                    </v-list-item>
                                </v-list>
                            </v-stepper-window-item>
                            <v-stepper-window-item value="4">
                                <v-row>
                                    <v-col class="text-center">
                                        <v-btn-group border divided>
                                            <v-btn prepend-icon="fa-solid fa-shuffle">Auto Sort</v-btn>
                                            <v-btn prepend-icon="fa-solid fa-maximize">Split All</v-btn>
                                            <v-btn prepend-icon="fa-solid fa-minimize">Merge All</v-btn>
                                        </v-btn-group>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-list>
                                            <v-list-item v-for="(s,i) in importResponse.recipe.steps" :key="i">
                                                <v-list-item-title>
                                                    <v-chip color="primary">#{{ i + 1 }}</v-chip>
                                                    <v-btn variant="plain" size="small" class="float-right">
                                                        <v-icon icon="$settings"></v-icon>
                                                        <v-menu activator="parent">
                                                            <v-list>
                                                                <v-list-item prepend-icon="$delete">{{ $t('Delete') }}</v-list-item>
                                                                <v-list-item prepend-icon="fa-solid fa-maximize">{{ $t('Split') }}</v-list-item>
                                                            </v-list>
                                                        </v-menu>
                                                    </v-btn>
                                                </v-list-item-title>
                                                <v-textarea class="mt-2" v-model="s.instruction"></v-textarea>
                                            </v-list-item>
                                        </v-list>
                                    </v-col>
                                </v-row>

                            </v-stepper-window-item>
                            <v-stepper-window-item value="5">
                                <v-btn @click="createRecipeFromImport()">Import</v-btn>
                            </v-stepper-window-item>
                        </v-stepper-window>

                        <v-stepper-actions @click:next="next"
                                           @click:prev="prev">

                        </v-stepper-actions>
                    </template>

                </v-stepper>


            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts" setup>

import {nextTick, ref} from "vue";
import {ApiApi, RecipeFromSourceResponse} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {useRouter} from "vue-router";

const router = useRouter()

const stepper = ref("1")
const importUrl = ref("")

const importResponse = ref({} as RecipeFromSourceResponse)

/**
 * call server to load recipe from a given URl
 */
function loadRecipeFromUrl() {
    let api = new ApiApi()
    api.apiRecipeFromSourceCreate({recipeFromSource: {url: importUrl.value}}).then(r => {
        importResponse.value = r
        if (r.duplicates.length == 0) {
            // automatically continue only if no duplicates were found
            stepper.value = "2"
        }
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

/**
 * create recipe in database
 */
function createRecipeFromImport() {
    let api = new ApiApi()
    console.log(importResponse.value)
    api.apiRecipeCreate({recipe: importResponse.value.recipe}).then(r => {
        router.push({name: 'view_recipe', params: {id: r.id}})
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })
}

</script>

<style scoped>

</style>