<template>
    <v-container>
        <v-card>
            <v-card-title class="text-h5">
               <v-icon :icon="THousehold.icon" size="small" class="mr-3"></v-icon> {{ $t('Households') }}
            </v-card-title>
            <v-card-text class="text-body-1">
                <p>{{$t('HouseholdSetup1')}}</p>
                <p class="mt-2">{{$t('HouseholdSetup2')}}</p>
                <p class="mt-2">{{$t('HouseholdSetup3')}}</p>
                <p class="mt-2">{{$t('HouseholdSetup4')}}</p>

                <v-row>
                    <v-col>
                        <v-text-field v-model="householdName" :label="$t('Household')" :disabled="useUserPreferenceStore().activeUserSpace?.household != null" class="mt-4">
                        </v-text-field>
                        <v-btn color="success" @click="createAndJoinHousehold" :loading="loading" :disabled="useUserPreferenceStore().activeUserSpace?.household != null">{{ $t('CreateAndJoin') }}</v-btn>
                    </v-col>
                </v-row>

                <v-row>
                    <database-model-col model="UserSpace" :disabled="useUserPreferenceStore().activeUserSpace?.household == null || loading" ></database-model-col>
                </v-row>

            </v-card-text>
            <v-card-actions>
                <v-btn color="warning" variant="tonal">{{ $t('Skip') }}</v-btn>
            </v-card-actions>
        </v-card>


    </v-container>
</template>

<script setup lang="ts">


import {ApiApi} from "@/openapi";
import {onMounted, ref} from "vue";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore.ts";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import {THousehold} from "@/types/Models.ts";
import {useRouter} from "vue-router";
import DatabaseModelCol from "@/components/display/DatabaseModelCol.vue";

const router = useRouter()

const loading = ref(false)
const householdName = ref("")


onMounted(() => {

})

function createAndJoinHousehold() {
    let api = new ApiApi()
    let userSpace = useUserPreferenceStore().activeUserSpace

    loading.value = true
    if (userSpace != null) {
        api.apiHouseholdCreate({household: {name: householdName.value}}).then(r => {
            userSpace.household = r

            api.apiUserSpaceUpdate({id: userSpace.id!, userSpace: userSpace}).then(r => {
                useUserPreferenceStore().activeSpace.householdSetupCompleted = true
                useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)


                api.apiSpacePartialUpdate({id: useUserPreferenceStore().activeSpace.id!, patchedSpace: useUserPreferenceStore().activeSpace}).then(r => {
                    useUserPreferenceStore().activeSpace = r
                }).catch(err => {
                    useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
                }).finally(() => {
                    loading.value = false
                })

            }).catch(err => {
                useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
                loading.value = false
            })

        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
            loading.value = false
        })
    }


}

</script>

<style scoped>


</style>