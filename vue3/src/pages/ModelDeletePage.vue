<template>

    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-text class="pt-2 pb-2">
                        <v-btn variant="flat" @click="router.go(-1)" prepend-icon="fa-solid fa-arrow-left">{{ $t('Back') }}</v-btn>
                        <v-btn variant="flat" @click="reloadAll()"
                               :loading="protectingObjectsLoading||cascadingObjectsLoading||nullingObjectsLoading" class="float-right" prepend-icon="fa-solid fa-arrows-rotate">
                            {{ $t('Refresh') }}
                        </v-btn>

                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row dense>
            <v-col>
                <v-card>
                    <v-tabs v-model="tab" grow>
                        <v-tab value="protecting">
                            {{ $t('Blocking') }}
                            <template #append>
                                <v-chip size="small">{{ protectingObjectsCount }}</v-chip>
                            </template>
                        </v-tab>
                        <v-tab value="cascading">
                            {{ $t('Cascading') }}
                            <template #append>
                                <v-chip size="small">{{ cascadingObjectsCount }}</v-chip>
                            </template>
                        </v-tab>
                        <v-tab value="nulling">
                            {{ $t('Changing') }}
                            <template #append>
                                <v-chip size="small">{{ nullingObjectsCount }}</v-chip>
                            </template>
                        </v-tab>
                    </v-tabs>
                </v-card>

                <v-tabs-window v-model="tab">
                    <v-tabs-window-item value="protecting">

                        <v-card :title="$t('Blocking')">
                            <v-card-text>
                                {{ $t('BlockingHelp', {type: $t(genericModel.model.localizationKey)}) }}
                                <v-data-table-server
                                    density="compact"
                                    :headers="tableHeaders"
                                    :loading="protectingObjectsLoading"
                                    :items-length="protectingObjectsCount"
                                    :items="protectingObjects"
                                    @update:options="loadProtected"
                                >
                                    <template #item.model="{item}">
                                        {{ $t(item.model) }}
                                    </template>
                                    <template #item.actions="{item}">
                                        <v-btn icon="$delete" variant="plain" size="small" target="_blank"
                                               :to="{name: 'ModelDeletePage', params: {model: item.model, id: item.id}}"></v-btn>
                                        <v-btn icon="$edit" variant="plain" size="small" target="_blank"
                                               :to="{name: 'ModelEditPage', params: {model: item.model, id: item.id}}"></v-btn>
                                    </template>
                                </v-data-table-server>
                            </v-card-text>
                        </v-card>

                    </v-tabs-window-item>
                    <v-tabs-window-item value="cascading">
                        <v-card>
                            <v-card-text>
                                {{ $t('CascadingHelp', {type: $t(genericModel.model.localizationKey)}) }}
                                <v-data-table-server
                                    density="compact"
                                    :headers="tableHeaders"
                                    :loading="cascadingObjectsLoading"
                                    :items-length="cascadingObjectsCount"
                                    :items="cascadingObjects"
                                    @update:options="loadCascading"
                                >
                                    <template #item.model="{item}">
                                        {{ $t(item.model) }}
                                    </template>
                                    <template #item.actions="{item}">
                                        <v-btn icon="$delete" variant="plain" size="small" target="_blank"
                                               :to="{name: 'ModelDeletePage', params: {model: item.model, id: item.id}}"></v-btn>
                                        <v-btn icon="$edit" variant="plain" size="small" target="_blank"
                                               :to="{name: 'ModelEditPage', params: {model: item.model, id: item.id}}"></v-btn>
                                    </template>
                                </v-data-table-server>
                            </v-card-text>
                        </v-card>
                    </v-tabs-window-item>
                    <v-tabs-window-item value="nulling">
                        <v-card>
                            <v-card-text>
                                {{ $t('NullingHelp', {type: $t(genericModel.model.localizationKey)}) }}
                                <v-data-table-server
                                    density="compact"
                                    :headers="tableHeaders"
                                    :loading="nullingObjectsLoading"
                                    :items-length="nullingObjectsCount"
                                    :items="nullingObjects"
                                    :items-per-page="pageSize"
                                    @update:options="loadNulling"
                                >
                                    <template #item.model="{item}">
                                        {{ $t(item.model) }}
                                    </template>
                                    <template #item.actions="{item}">
                                        <v-btn icon="$delete" variant="plain" size="small" target="_blank"
                                               :to="{name: 'ModelDeletePage', params: {model: item.model, id: item.id}}"></v-btn>
                                        <v-btn icon="$edit" variant="plain" size="small" target="_blank"
                                               :to="{name: 'ModelEditPage', params: {model: item.model, id: item.id}}"></v-btn>
                                    </template>
                                </v-data-table-server>
                            </v-card-text>
                        </v-card>
                    </v-tabs-window-item>
                </v-tabs-window>


            </v-col>
        </v-row>
        <v-row dense>
            <v-col>
                <v-card class="border-error border-sm border-opacity-100">
                    <v-card-title>{{ $t('Delete') }}</v-card-title>
                    <v-card-text>
                        {{ $t('delete_confirmation', {source: `${$t(genericModel.model.localizationKey)} ${genericModel.getLabel(editingObj)}`}) }}
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="delete" prepend-icon="$delete" :disabled="protectingObjectsCount > 0" @click="deleteObject()" :loading="deleteLoading">{{ $t('Delete') }}</v-btn>
                    </v-card-actions>

                </v-card>
            </v-col>
        </v-row>
    </v-container>

</template>

<script setup lang="ts">

import {onBeforeMount, onMounted, PropType, ref} from "vue";
import {EditorSupportedModels, GenericModel, getGenericModelFromString} from "@/types/Models.ts";
import {useTitle} from "@vueuse/core";
import {useI18n} from "vue-i18n";
import {GenericModelReference} from "@/openapi";
import {VDataTableUpdateOptions} from "@/vuetify.ts";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {useRouter} from "vue-router";
import {VDataTableHeaders} from "vuetify/components";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

const router = useRouter()
const title = useTitle()
const {t} = useI18n()

const props = defineProps({
    model: {type: String as PropType<EditorSupportedModels>, required: true},
    id: {type: String, required: true},
})

const tableHeaders = [
    {title: 'ID', key: 'id',},
    {title: t('Model'), key: 'model',},
    {title: t('Name'), key: 'name',},
    {title: t('Actions'), key: 'actions', align: 'end'},
] as VDataTableHeaders[]

const genericModel = ref({} as GenericModel)
const editingObj = ref({} as EditorSupportedModels)
const tab = ref('protecting')
const deleteLoading = ref(false)

const pageSize = ref(useUserPreferenceStore().deviceSettings.general_tableItemsPerPage)

const protectingObjects = ref([] as GenericModelReference[])
const protectingObjectsCount = ref(0)
const protectingObjectsLoading = ref(false)

const cascadingObjects = ref([] as GenericModelReference[])
const cascadingObjectsCount = ref(0)
const cascadingObjectsLoading = ref(false)

const nullingObjects = ref([] as GenericModelReference[])
const nullingObjectsCount = ref(0)
const nullingObjectsLoading = ref(false)

/**
 * select model class before mount because template renders (and requests item load) before onMounted is called
 */
onBeforeMount(() => {
    try {
        genericModel.value = getGenericModelFromString(props.model, t)
    } catch (Error) {
        console.error('Invalid model passed to ModelListPage, loading Food instead')
        genericModel.value = getGenericModelFromString('Food', t)
    }
})

onMounted(() => {
    loadObject()
    reloadAll()
})

function loadObject() {
    genericModel.value.retrieve(Number(props.id)).then(obj => {
        editingObj.value = obj
        title.value = t('DeleteSomething', {item: `${t(genericModel.value.model.localizationKey)} ${genericModel.value.getLabel(editingObj.value)}`})
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

function deleteObject() {
    deleteLoading.value = true
    genericModel.value.destroy(Number(props.id)).then(() => {
        router.push({name: 'ModelListPage', params: {model: props.model}})
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
    }).finally(() => {
        deleteLoading.value = false
    })
}

function reloadAll() {
    loadProtected({page: 1, itemsPerPage: pageSize.value})
    loadCascading({page: 1, itemsPerPage: pageSize.value})
    loadNulling({page: 1, itemsPerPage: pageSize.value})
}

function loadProtected(options: VDataTableUpdateOptions) {

    protectingObjectsLoading.value = true
    genericModel.value.getDeleteProtecting({id: Number(props.id), page: options.page, pageSize: options.itemsPerPage}).then(r => {
        protectingObjects.value = r.results
        protectingObjectsCount.value = r.count
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        protectingObjectsLoading.value = false
    })
}

function loadCascading(options: VDataTableUpdateOptions) {

    cascadingObjectsLoading.value = true
    genericModel.value.getDeleteCascading({id: Number(props.id), page: options.page, pageSize: options.itemsPerPage}).then(r => {
        cascadingObjects.value = r.results
        cascadingObjectsCount.value = r.count
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        cascadingObjectsLoading.value = false
    })

}

function loadNulling(options: VDataTableUpdateOptions) {

    nullingObjectsLoading.value = true
    genericModel.value.getDeleteNulling({id: Number(props.id), page: options.page, pageSize: options.itemsPerPage}).then(r => {
        nullingObjects.value = r.results
        nullingObjectsCount.value = r.count
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        nullingObjectsLoading.value = false
    })

}

</script>

<style scoped>

</style>