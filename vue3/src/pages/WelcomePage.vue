<template>
    <v-container>


        <v-stepper editable v-model="stepper">
            <v-stepper-header>

                <v-stepper-item :title="$t('Settings')" value="1"></v-stepper-item>
                <v-divider></v-divider>
                <v-stepper-item :title="$t('Open Data')" value="2"></v-stepper-item>
                <v-divider></v-divider>
                <v-stepper-item :title="$t('Household')" value="3"></v-stepper-item>
                <v-divider></v-divider>
                <v-stepper-item :title="$t('Invites')" value="4"></v-stepper-item>
                <v-divider></v-divider>
                <v-stepper-item :title="$t('GettingStarted')" value="5"></v-stepper-item>
            </v-stepper-header>

            <v-stepper-window>
                <v-stepper-window-item value="1">
                    <v-card flat>
                        <v-card-title class="text-h4">{{ $t('WelcometoTandoor') }} <span class="text-tandoor">{{ useUserPreferenceStore().userSettings.user.displayName }}</span>
                        </v-card-title>
                        <v-card-text v-if="space">
                            <p class="text-subtitle-1 mb-4">{{ $t('WelcomeSettingsHelp') }}</p>

                            <v-text-field v-model="space.name" :label="$t('SpaceName')"></v-text-field>

                            <v-select :label="$t('Theme')" v-model="useUserPreferenceStore().userSettings.theme"
                                      :items="[{title: $t('Light'), value: 'TANDOOR'}, {title: $t('Dark'), value: 'TANDOOR_DARK'}, ]">
                            </v-select>

                            <v-text-field v-model="useUserPreferenceStore().userSettings.defaultUnit" :label="$t('Default_Unit')" :hint="$t('DefaultUnitHelp')" persistent-hint></v-text-field>

                        </v-card-text>
                    </v-card>

                    <v-stepper-actions>
                        <template #prev>
                            <v-spacer></v-spacer>
                        </template>
                        <template #next>
                            <v-btn @click="finishWelcome()" color="warning" class="me-2" :loading="loading">{{ $t('SkipIntroduction') }}</v-btn>
                            <v-btn @click="updateSpaceAndUserSettings()" :loading="loading" color="success">{{ $t('Next') }}</v-btn>
                        </template>
                    </v-stepper-actions>

                </v-stepper-window-item>

                <v-stepper-window-item value="2">
                    <v-card flat>
                        <v-card-text>
                            <v-card
                                variant="outlined"
                                prepend-icon="fa-solid fa-cloud-arrow-down">
                                <template #title>
                                    <span class="text-h6">{{ $t('CommunityData') }}</span>
                                </template>
                                <template #subtitle>
                                    <p class="text-wrap text-body-1">
                                        {{ $t('StartWithOpenData') }}
                                    </p>
                                </template>
                                <v-card-text>
                                    <open-data-import-settings hide-details hide-update-existing hide-header @importDone="stepper = '3'"></open-data-import-settings>
                                </v-card-text>
                            </v-card>

                            <v-card
                                variant="outlined"
                                @click="stepper = '3'"
                                prepend-icon="fa-solid fa-file"
                                append-icon="fa-solid fa-arrow-right"
                                class="mt-4">
                                <template #title>
                                    <span class="text-h6">{{ $t('Empty') }}</span>
                                </template>
                                <template #subtitle>
                                    <p class="text-wrap text-body-1">
                                        {{ $t('StartEmpty') }}
                                    </p>
                                </template>
                            </v-card>

                        </v-card-text>
                    </v-card>

                    <v-stepper-actions>
                        <template #prev>
                            <v-btn @click="stepper = '1'">{{ $t('Back') }}</v-btn>
                        </template>
                        <template #next>

                        </template>
                    </v-stepper-actions>

                </v-stepper-window-item>

                <v-stepper-window-item value="3">
                    <v-card flat>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-card :prepend-icon="TSpace.icon" variant="outlined" class="h-100">
                                        <template #title>
                                            <span class="text-h6">{{ $t('Space') }}</span>
                                        </template>
                                        <template #subtitle>
                                            <p class="text-wrap text-body-1">{{ $t('SpaceHelp') }}</p>
                                        </template>
                                        <v-card-text class="d-flex flex-wrap ga-2">
                                            <v-chip v-for="model in [TRecipe, TFood, TUnit, TSupermarket, TKeyword]" :key="model.name" variant="tonal">
                                                <v-icon :icon="model.icon" color="tandoor" size="large" class="me-2"></v-icon>
                                                {{ $t(model.localizationKey) }}
                                            </v-chip>
                                            <v-chip variant="tonal">
                                                <v-icon icon="fa-solid fa-ellipsis" color="tandoor" size="large" class="me-2"></v-icon>
                                                {{ $t('More') }}
                                            </v-chip>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-card :prepend-icon="THousehold.icon" variant="outlined" class="h-100">
                                        <template #title>
                                            <span class="text-h6">{{ $t('Household') }}</span>
                                        </template>
                                        <template #subtitle>
                                            <p class="text-wrap text-body-1">{{ $t('SpaceHouseholdHelp') }}</p>
                                        </template>
                                        <v-card-text>
                                            <div class="d-flex flex-wrap ga-2 mb-4">
                                                <v-chip v-for="model in [TMealPlan, TShoppingListEntry, TInventoryEntry]" :key="model.name" variant="tonal">
                                                    <v-icon :icon="model.icon" color="tandoor" size="large" class="me-2"></v-icon>
                                                    {{ $t(model.localizationKey) }}
                                                </v-chip>
                                            </div>
                                            <v-text-field v-if="useUserPreferenceStore().activeUserSpace?.household == undefined" v-model="householdName" :label="$t('Household')"
                                                          hide-details></v-text-field>
                                            <div v-else class="d-flex align-center text-body-1">
                                                <v-icon :icon="THousehold.icon" class="me-2"></v-icon>
                                                {{ useUserPreferenceStore().activeUserSpace?.household?.name }}
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

                    <v-stepper-actions>
                        <template #prev>
                            <v-btn @click="stepper = '2'">{{ $t('Back') }}</v-btn>
                        </template>
                        <template #next>
                            <v-btn @click="householdAndNext('4')" color="success" :loading="loading">{{ $t('Next') }}</v-btn>
                        </template>
                    </v-stepper-actions>
                </v-stepper-window-item>

                <v-stepper-window-item value="4">
                    <v-card flat>
                        <v-card-text>
                            <v-card
                                variant="outlined"
                                :prepend-icon="TInviteLink.icon"
                                @click="">
                                <template #title>
                                    <span class="text-h6">{{ $t('Invite') }}</span>
                                </template>
                                <template #subtitle>
                                    <p class="text-wrap text-body-1">
                                        {{ $t('InviteWelcomeHelp') }}
                                    </p>
                                </template>
                                <model-edit-dialog model="InviteLink" activator="parent" :close-after-create="false" :close-after-save="false"></model-edit-dialog>
                            </v-card>

                            <v-card
                                variant="outlined"
                                @click="stepper = '5'"
                                prepend-icon="fa-solid fa-file"
                                append-icon="fa-solid fa-arrow-right"
                                class="mt-4">
                                <template #title>
                                    <span class="text-h6">{{ $t('Skip') }}</span>
                                </template>
                                <template #subtitle>
                                    <p class="text-wrap text-body-1">
                                        {{ $t('SkipInviteWelcome') }}
                                    </p>
                                </template>
                            </v-card>
                        </v-card-text>
                    </v-card>
                    <v-stepper-actions>
                        <template #prev>
                            <v-btn @click="stepper = '3'">{{ $t('Back') }}</v-btn>
                        </template>
                        <template #next>
                            <v-btn @click="stepper = '5'" color="success" :loading="loading">{{ $t('Next') }}</v-btn>
                        </template>
                    </v-stepper-actions>
                </v-stepper-window-item>

                <v-stepper-window-item value="5">
                    <v-card flat>

                        <v-card-text>

                            <v-card
                                variant="outlined"
                                @click="finishWelcome({name: 'ModelEditPage', params: {model: 'Recipe'}})"
                                prepend-icon="$recipes"
                                append-icon="fa-solid fa-arrow-right"
                                class="mb-4">
                                <template #title>
                                    <span class="text-h6">{{ $t('Create Recipe') }}</span>
                                </template>
                                <template #subtitle>
                                    <p class="text-wrap text-body-1">
                                        {{ $t('CreateFirstRecipe') }}
                                    </p>
                                </template>
                            </v-card>

                            <v-card
                                variant="outlined"
                                @click="finishWelcome({name: 'RecipeImportPage', params: {}})"
                                prepend-icon="$import"
                                append-icon="fa-solid fa-arrow-right">
                                <template #title>
                                    <span class="text-h6">{{ $t('Import') }}</span>
                                </template>
                                <template #subtitle>
                                    <p class="text-wrap text-body-1">
                                        {{ $t('ImportFirstRecipe') }}
                                    </p>
                                </template>
                            </v-card>


                        </v-card-text>
                    </v-card>

                    <v-stepper-actions>
                        <template #prev>
                            <v-btn @click="stepper = '4'">{{ $t('Back') }}</v-btn>
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
import {TFood, THousehold, TInventoryEntry, TInventoryLocation, TInviteLink, TKeyword, TMealPlan, TRecipe, TRecipeBook, TShoppingListEntry, TSpace, TSupermarket, TUnit} from "@/types/Models.ts";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {RouteLocationRaw, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";

const router = useRouter()
const {t} = useI18n()

const space = ref<undefined | Space>(undefined)
const householdName = ref("")
const stepper = ref("1")
const loading = ref(false)

onMounted(() => {
    loadSpace()

    householdName.value = useUserPreferenceStore().activeUserSpace?.user.displayName + '\'s ' + t('Household')
})

/**
 * save setup completion and redirect to target page
 * @param target
 */
function finishWelcome(target: RouteLocationRaw = {name: 'StartPage'}) {
    if (space.value) {
        space.value.spaceSetupCompleted = true
        space.value.householdSetupCompleted = true
        loading.value = true
        updateSpace().then(() => {
            router.replace(target)
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

function householdAndNext(nextStep: string) {
    let api = new ApiApi()
    let userSpace = useUserPreferenceStore().activeUserSpace

    if (householdName.value != "" && userSpace != null && userSpace.household == undefined) {
        loading.value = true

        api.apiHouseholdCreate({household: {name: householdName.value}}).then(r => {
            userSpace.household = r

            api.apiUserSpaceUpdate({id: userSpace.id!, userSpace: userSpace}).then(r => {
                stepper.value = nextStep
            }).catch(err => {
                useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
            }).finally(() => {
                loading.value = false
            })
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
            loading.value = false
        })
    } else {
        stepper.value = nextStep
    }

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