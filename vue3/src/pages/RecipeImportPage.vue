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

                                    <v-list-item border v-for="k in importResponse.recipe.keywords" :key="k" :class="{'bg-success': k.import}" @click="k.import = !k.import">
                                        {{ k.label }}
                                        <template #append>
                                            <v-checkbox-btn :model-value="k.import"></v-checkbox-btn>
                                        </template>
                                    </v-list-item>

                                </v-list>
                            </v-stepper-window-item>
                            <v-stepper-window-item value="4">
                                test4
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
        stepper.value = "2"
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

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