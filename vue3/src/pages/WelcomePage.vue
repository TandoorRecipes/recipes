<template>
    <v-container>


        <v-stepper editable v-model="stepper">
            <v-stepper-header>

                <v-stepper-item :title="$t('Settings')" value="1"></v-stepper-item>
                <v-divider></v-divider>
                <v-stepper-item :title="$t('Open Data')" value="2"></v-stepper-item>
                <v-divider></v-divider>
                <v-stepper-item :title="$t('Invites')" value="3"></v-stepper-item>
                <v-divider></v-divider>
                <v-stepper-item :title="$t('GettingStarted')" value="4"></v-stepper-item>
            </v-stepper-header>

            <v-stepper-window>
                <v-stepper-window-item value="1">
                    <v-card flat>
                        <v-card-title class="text-h4">{{ $t('WelcometoTandoor') }} <span class="text-tandoor">{{useUserPreferenceStore().userSettings.user.displayName}}</span></v-card-title>
                        <v-card-text v-if="space">
                            <p class="text-subtitle-1 mb-4">{{ $t('WelcomeSettingsHelp') }}</p>

                            <v-text-field v-model="space.name" :label="$t('Name')"></v-text-field>

                            <v-select :label="$t('Theme')" v-model="useUserPreferenceStore().userSettings.theme"
                                      :items="[{title: 'Tandoor', value: 'TANDOOR'}, {title: 'Tandoor Dark', value: 'TANDOOR_DARK'}, ]">
                            </v-select>

                            <v-text-field v-model="useUserPreferenceStore().userSettings.defaultUnit" :label="$t('Default_Unit')"></v-text-field>

                            <v-checkbox :label="$t('Use_Fractions')" :hint="$t('Use_Fractions_Help')" persistent-hint v-model="useUserPreferenceStore().userSettings.useFractions"></v-checkbox>

                        </v-card-text>
                    </v-card>

                    <v-stepper-actions>
                        <template #prev>
                            <v-spacer></v-spacer>
                        </template>
                        <template #next>
                            <v-btn @click="finishWelcome()" color="warning" class="me-2" :loading="loading">{{ $t('Skip') }}</v-btn>
                            <v-btn @click="updateSpaceAndUserSettings()" :loading="loading" color="success">{{ $t('Next') }}</v-btn>
                        </template>
                    </v-stepper-actions>

                </v-stepper-window-item>

                <v-stepper-window-item value="2">
                    <v-card flat>
                        <v-card-text>
                            <open-data-import-settings></open-data-import-settings>
                        </v-card-text>
                    </v-card>

                    <v-stepper-actions>
                        <template #prev>
                            <v-btn @click="stepper = '1'">{{ $t('Back') }}</v-btn>
                        </template>
                        <template #next>
                            <v-btn @click="stepper = '3'" color="success">{{ $t('Next') }}</v-btn>
                        </template>
                    </v-stepper-actions>

                </v-stepper-window-item>

                <v-stepper-window-item value="3">
                    <v-card flat>
                        <v-card-text class="text-center">
                            <v-card variant="outlined">
                                <v-card-title class="text-h4 pb-0 mb-0 text-center">{{ $t('Space') }}</v-card-title>
                                <v-card-subtitle class="text-subtitle-1 text-center mb-4">{{ $t('SpaceHelp') }}</v-card-subtitle>
                                <v-card-text>
                                    <v-row>
                                        <v-col class="text-center" v-for="model in [TRecipe, TFood, TUnit, TSupermarket, TKeyword]">
                                            <v-icon :icon="model.icon" size="x-large"></v-icon>
                                            <p class="text-h6">{{ $t(model.localizationKey) }}</p>
                                        </v-col>
                                        <v-col class="text-center">
                                            <v-icon icon="fa-solid fa-ellipsis" size="x-large"></v-icon>
                                            <p class="text-h6">{{ $t('More') }}</p>
                                        </v-col>
                                    </v-row>

                                    <div class="border-md border-opacity-75 border-dotted rounded mt-5 w-md-75 ml-auto mr-auto">
                                        <v-card-subtitle class="text-subtitle-1 text-center mb-4 mt-2 text-wrap">
                                            {{ $t('SpacePrivateObjectsHelp') }}
                                        </v-card-subtitle>
                                        <v-row>
                                            <v-col class="text-center" v-for="model in [TMealPlan, TShoppingListEntry, TRecipeBook]">
                                                <v-icon :icon="model.icon" size="x-large"></v-icon>
                                                <p class="text-h6">{{ $t(model.localizationKey) }}</p>
                                            </v-col>
                                        </v-row>
                                    </div>
                                </v-card-text>
                            </v-card>

                            <v-btn size="x-large" class="mt-4" variant="outlined">{{ $t('CreateInvitation') }}
                                <model-edit-dialog model="InviteLink" :close-after-create="false" :close-after-save="false"></model-edit-dialog>
                            </v-btn>
                        </v-card-text>
                    </v-card>

                    <v-stepper-actions>
                        <template #prev>
                            <v-btn @click="stepper = '2'" color="success">{{ $t('Back') }}</v-btn>
                        </template>
                        <template #next>
                            <v-btn @click="stepper = '4'" color="success">{{ $t('Next') }}</v-btn>
                        </template>
                    </v-stepper-actions>
                </v-stepper-window-item>

                <v-stepper-window-item value="4">
                    <v-card flat>

                        <v-card-text>

                            <v-card
                                :title="$t('Create Recipe')"
                                variant="outlined"
                                @click="finishWelcome({name: 'ModelEditPage', params: {model: 'Recipe'}})"
                                prepend-icon="$recipes"
                                append-icon="fa-solid fa-arrow-right"
                                class="mb-4">
                                <template #subtitle>
                                    <p class="text-wrap">
                                        {{ $t('CreateFirstRecipe') }}
                                    </p>
                                </template>
                            </v-card>

                            <v-card
                                :title="$t('Import')"
                                variant="outlined"
                                @click="finishWelcome({name: 'RecipeImportPage', params: {}})"
                                prepend-icon="$import"
                                append-icon="fa-solid fa-arrow-right">
                                <template #subtitle>
                                    <p class="text-wrap">
                                        {{ $t('ImportFirstRecipe') }}
                                    </p>
                                </template>
                            </v-card>


                        </v-card-text>
                    </v-card>

                    <v-stepper-actions>
                        <template #prev>
                            <v-btn @click="stepper = '2'" color="success">{{ $t('Back') }}</v-btn>
                        </template>
                        <template #next>
                            <v-btn @click="finishWelcome()" color="success" :disabled="false">{{ $t('Finish') }}</v-btn>
                        </template>
                    </v-stepper-actions>

                </v-stepper-window-item>

            </v-stepper-window>

        </v-stepper>

    </v-container>
</template>

<script setup lang="ts">


import {ApiApi, Space} from "@/openapi";
import {onMounted, ref} from "vue";
import {ErrorMessageType, MessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import OpenDataImportSettings from "@/components/settings/OpenDataImportSettings.vue";
import {TFood, TKeyword, TMealPlan, TRecipe, TRecipeBook, TShoppingListEntry, TSupermarket, TUnit} from "@/types/Models.ts";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {RouteLocationRaw, useRouter} from "vue-router";

const router = useRouter()

const space = ref<undefined | Space>(undefined)
const stepper = ref("1")
const loading = ref(false)

onMounted(() => {
    loadSpace()
})

/**
 * save setup completion and redirect to target page
 * @param target
 */
function finishWelcome(target: RouteLocationRaw = {name: 'StartPage'}) {
    if (space.value) {
        space.value.spaceSetupCompleted = true
        loading.value = true
        updateSpace().then(() => {
            router.push(target)
            loading.value = false
        })
    } else {
        useMessageStore().addMessage(MessageType.ERROR, "Space not loaded yet", 5000)
    }
}

/**
 * load active space data
 */
function loadSpace() {
    let api = new ApiApi()

    api.apiSpaceCurrentRetrieve().then(r => {
        space.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

/**
 * update both the space and user settings
 */
function updateSpaceAndUserSettings() {
    let promises = [] as Promise<any>[]
    loading.value = true

    promises.push(updateSpace())
    promises.push(useUserPreferenceStore().updateUserSettings(true))

    Promise.allSettled(promises).then(r => {
        loading.value = false
        stepper.value = "2"
    })
}

/**
 * update space in database
 */
function updateSpace() {
    let api = new ApiApi()
    return api.apiSpacePartialUpdate({id: space.value.id, patchedSpace: space.value}).then(r => {
        space.value = r
        useUserPreferenceStore().activeSpace = Object.assign({}, space.value)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })
}

</script>

<style scoped>


</style>