<template>

    <v-row>
        <v-col>
            <p class="text-h6">
                {{ $t('YourSpaces') }}
                <v-btn color="create" prepend-icon="$add" class="float-right" size="small" :href="getDjangoUrl('space-overview')">{{$t('New')}}</v-btn>
            </p>
            <v-divider></v-divider>
        </v-col>
    </v-row>

    <v-row>
        <v-col cols="6" v-for="s in spaces" :key="s.id">
            <v-card @click="useUserPreferenceStore().switchSpace(s)">
                <v-img height="200px" cover :src="(s.image !== undefined) ? s.image?.preview  : recipeDefaultImage" :alt="$t('Image')"></v-img>
                <v-card-title>{{ s.name }}
                    <v-chip variant="tonal" density="compact" color="error" v-if="s.id == useUserPreferenceStore().activeSpace.id">{{ $t('active') }}</v-chip>
                </v-card-title>
                <v-card-subtitle>{{ $t('created_by') }} {{ s.createdBy.displayName }}</v-card-subtitle>
            </v-card>
        </v-col>
    </v-row>
</template>


<script setup lang="ts">

import {onMounted, ref} from "vue";
import {ApiApi, Space} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import recipeDefaultImage from '../../assets/recipe_no_image.svg'
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {useDjangoUrls} from "@/composables/useDjangoUrls";

const {getDjangoUrl} = useDjangoUrls()

const spaces = ref([] as Space[])

onMounted(() => {
    const api = new ApiApi()

    api.apiSpaceList().then(r => {
        spaces.value = r.results
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
})
</script>

<style scoped>

</style>