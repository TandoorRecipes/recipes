<template>
    <v-dialog max-width="600px" activator="parent" v-model="dialog">
        <v-card>
            <v-closable-card-title :title="$t('Share')" :sub-title="recipe.name" v-model="dialog"></v-closable-card-title>
            <v-card-text>
                <v-text-field :label="$t('Link')" v-model="shareLink.link" :loading="loading">
                    <template #append-inner>
                        <btn-copy :copy-value="shareLink.link" color="" variant="plain"></btn-copy>
                    </template>
                </v-text-field>

            </v-card-text>
            <v-card-actions>
                <v-btn class="float-right" @click="dialog = false">{{ $t('Close') }}</v-btn>
                <v-btn class="float-right" color="success" prepend-icon="fa-solid fa-share-nodes" @click="shareIntend()">{{ $t('Share') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {onMounted, PropType, ref, watch} from "vue";
import {ApiApi, Recipe, RecipeFlat, RecipeOverview, ShareLink} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import BtnCopy from "@/components/buttons/BtnCopy.vue";
import {useI18n} from "vue-i18n";

const props = defineProps({
    recipe: {type: Object as PropType<Recipe | RecipeFlat | RecipeOverview>, required: true}
})

const {t} = useI18n()

const dialog = ref(false)
const loading = ref(false)
const shareLink = ref({} as ShareLink)

// watch change to dialog open and generate share link when dialog is opened
watch(dialog, (newValue, oldValue) => {
    if (!oldValue && newValue) {
        generateShareLink()
    }
})

/**
 * request api to generate share link
 */
function generateShareLink() {
    let api = new ApiApi()
    loading.value = true

    api.apiShareLinkRetrieve({id: props.recipe.id!}).then(r => {
        shareLink.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

/**
 * trigger navigator share event
 */
function shareIntend() {
    let shareData = {
        title: props.recipe.name,
        text: `${t("Check out this recipe: ")} ${props.recipe.name}`,
        url: shareLink.value.link,
    }
    navigator.share(shareData)
}

</script>

<style scoped>

</style>