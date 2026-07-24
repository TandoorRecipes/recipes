<template>

    <v-container>
        <template v-if="!loadError">
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
        <v-row v-if="editingObj" density="compact">
            <v-col>
                <v-card>
                    <v-card-title class="text-h4">{{ $t('Delete') }} {{ $t(genericModel.model.localizationKey) }}{{ deleteLabel ? ': ' + deleteLabel : '' }}</v-card-title>
                </v-card>
            </v-col>
        </v-row>
        <v-row density="compact" v-if="protectingObjectsCount > 0 || cascadingObjectsCount > 0 || nullingObjectsCount > 0">
            <v-col>
                <v-card>
                    <v-tabs v-model="tab" grow>
                        <v-tab value="protecting" v-if="protectingObjectsCount > 0">
                            {{ $t('Blocking') }}
                            <template #append>
                                <v-chip size="small">{{ protectingObjectsCount }}</v-chip>
                            </template>
                        </v-tab>
                        <v-tab value="cascading" v-if="cascadingObjectsCount > 0">
                            {{ $t('Cascading') }}
                            <template #append>
                                <v-chip size="small">{{ cascadingObjectsCount }}</v-chip>
                            </template>
                        </v-tab>
                        <v-tab value="nulling" v-if="nullingObjectsCount > 0">
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
                                    <template #item.name="{item}">
                                        <div data-test="relation-name" class="relation-name cursor-pointer"
                                             :class="{ 'relation-name--expanded': isRelationNameExpanded(item) }"
                                             @click="toggleRelationName(item)">{{ item.name }}</div>
                                    </template>
                                    <template #item.actions="{item}">
                                        <v-btn icon="$delete" variant="plain" size="small" target="_blank"
                                               v-if="getGenericModelFromString(item.model, $t) && getGenericModelFromString(item.model, $t).model.isAdvancedDelete"
                                               :to="{name: 'ModelDeletePage', params: {model: item.model, id: item.id}}"></v-btn>
                                        <v-btn icon="$delete" variant="plain" size="small"
                                               v-if="getGenericModelFromString(item.model, $t) && !getGenericModelFromString(item.model, $t).model.isAdvancedDelete && !getGenericModelFromString(item.model, $t).model.disableDelete">
                                            <v-icon icon="$delete" variant="plain" size="small"></v-icon>
                                            <delete-confirm-dialog :object-name="genericModel.getLabel(editingObj)" :model-name="$t(genericModel.model.localizationKey)"
                                                                   @delete="deleteRelated(item.model, item.id)"></delete-confirm-dialog>
                                        </v-btn>
                                        <v-btn icon="$edit" variant="plain" size="small" target="_blank"
                                               v-if="getGenericModelFromString(item.model, $t) && getGenericModelFromString(item.model, $t).model.editorComponent"
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
                                    <template #item.name="{item}">
                                        <div data-test="relation-name" class="relation-name cursor-pointer"
                                             :class="{ 'relation-name--expanded': isRelationNameExpanded(item) }"
                                             @click="toggleRelationName(item)">{{ item.name }}</div>
                                    </template>
                                    <template #item.actions="{item}">
                                        <v-btn icon="$delete" variant="plain" size="small" target="_blank"
                                               v-if="getGenericModelFromString(item.model, $t) && getGenericModelFromString(item.model, $t).model.isAdvancedDelete"
                                               :to="{name: 'ModelDeletePage', params: {model: item.model, id: item.id}}"></v-btn>
                                        <v-btn icon="$delete" variant="plain" size="small"
                                               v-if="getGenericModelFromString(item.model, $t) && !getGenericModelFromString(item.model, $t).model.isAdvancedDelete && !getGenericModelFromString(item.model, $t).model.disableDelete">
                                            <v-icon icon="$delete" variant="plain" size="small"></v-icon>
                                            <delete-confirm-dialog :object-name="genericModel.getLabel(editingObj)" :model-name="$t(genericModel.model.localizationKey)"
                                                                   @delete="deleteRelated(item.model, item.id)"></delete-confirm-dialog>
                                        </v-btn>
                                        <v-btn icon="$edit" variant="plain" size="small" target="_blank"
                                               v-if="getGenericModelFromString(item.model, $t) && getGenericModelFromString(item.model, $t).model.editorComponent"
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
                                    <template #item.name="{item}">
                                        <div data-test="relation-name" class="relation-name cursor-pointer"
                                             :class="{ 'relation-name--expanded': isRelationNameExpanded(item) }"
                                             @click="toggleRelationName(item)">{{ item.name }}</div>
                                    </template>
                                    <template #item.actions="{item}">
                                        <v-btn icon="$delete" variant="plain" size="small" target="_blank"
                                               v-if="getGenericModelFromString(item.model, $t) && getGenericModelFromString(item.model, $t).model.isAdvancedDelete"
                                               :to="{name: 'ModelDeletePage', params: {model: item.model, id: item.id}}"></v-btn>
                                        <v-btn icon="$delete" variant="plain" size="small"
                                               v-if="getGenericModelFromString(item.model, $t) && !getGenericModelFromString(item.model, $t).model.isAdvancedDelete && !getGenericModelFromString(item.model, $t).model.disableDelete">
                                            <v-icon icon="$delete" variant="plain" size="small"></v-icon>
                                            <delete-confirm-dialog :object-name="genericModel.getLabel(editingObj)" :model-name="$t(genericModel.model.localizationKey)"
                                                                   @delete="deleteRelated(item.model, item.id)"></delete-confirm-dialog>
                                        </v-btn>
                                        <v-btn icon="$edit" variant="plain" size="small" target="_blank"
                                               v-if="getGenericModelFromString(item.model, $t) && getGenericModelFromString(item.model, $t).model.editorComponent"
                                               :to="{name: 'ModelEditPage', params: {model: item.model, id: item.id}}"></v-btn>
                                    </template>
                                </v-data-table-server>
                            </v-card-text>
                        </v-card>
                    </v-tabs-window-item>
                </v-tabs-window>


            </v-col>
        </v-row>
        <v-row v-if="genericModel.model.isMerge" density="compact">
            <v-col>
                <v-card class="border-warning border-sm border-opacity-100">
                    <v-card-title>{{ $t('Merge') }}</v-card-title>
                    <v-card-text>
                        {{ $t('MergeInsteadOfDelete', {type: $t(genericModel.model.localizationKey)}) }}
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="warning" prepend-icon="fa-solid fa-arrows-to-dot">
                            {{ $t('Merge') }}
                            <model-merge-dialog :model="model" :source="[editingObj]"
                                                @change="router.push({name: 'ModelListPage', params: {model: props.model}})"></model-merge-dialog>
                        </v-btn>
                    </v-card-actions>

                </v-card>
            </v-col>
        </v-row>
        <v-row density="compact">
            <v-col>
                <v-card class="border-error border-sm border-opacity-100">
                    <v-card-title>{{ $t('Delete') }}</v-card-title>
                    <v-card-text>
                        {{ $t('delete_confirmation', {source: `${$t(genericModel.model.localizationKey)} ${deleteLabel}`}) }}
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="delete" prepend-icon="$delete" data-test="model-delete-button" :disabled="protectingObjectsCount > 0 || genericModel.model.disableDelete" @click="deleteObject()" :loading="deleteLoading">{{
                                $t('Delete')
                            }}
                        </v-btn>
                    </v-card-actions>

                </v-card>
            </v-col>
        </v-row>
        </template>
        <v-row v-else density="compact">
            <v-col>
                <v-card data-test="model-not-found" variant="flat" class="mt-md-4 text-center pa-8">
                    <div class="text-h6 mb-4">{{ loadError === 'notfound' ? $t('NotFound') : $t('err_fetching_resource') }}</div>
                    <v-btn :to="{name: 'ModelListPage', params: {model}}" color="primary" variant="tonal">{{ $t('Back') }}</v-btn>
                </v-card>
            </v-col>
        </v-row>
    </v-container>

</template>

<script setup lang="ts">

import {computed, onBeforeMount, onMounted, PropType, ref} from "vue";
import {DateTime} from "luxon";
import {EditorSupportedModels, GenericModel, getGenericModelFromString} from "@/types/Models.ts";
import {useTitle} from "@vueuse/core";
import {useI18n} from "vue-i18n";
import {ApiApi, GenericModelReference} from "@/openapi";
import {VDataTableUpdateOptions} from "@/vuetify.ts";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {useRouter} from "vue-router";
import {VDataTableHeaders} from "vuetify/components";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import ModelMergeDialog from "@/components/dialogs/ModelMergeDialog.vue";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";

const router = useRouter()
const title = useTitle()
const {t} = useI18n()

const props = defineProps({
    model: {type: String as PropType<EditorSupportedModels>, required: true},
    id: {type: String, required: true},
})

// Compact for narrow screens: the related object's ID is low-value here, and the Name
// column is click-to-expand (see relation-name slot), so the table fits a phone width.
const tableHeaders = [
    {title: t('Model'), key: 'model', nowrap: true},
    {title: t('Name'), key: 'name'},
    {title: t('Actions'), key: 'actions', align: 'end', nowrap: true},
] as VDataTableHeaders[]

const genericModel = ref({} as GenericModel)
const editingObj = ref({} as EditorSupportedModels)

/**
 * human label for the object being deleted; falls back to "#id · created date"
 * (or just "#id") for name-less models so the confirmation is never a dangling colon
 */
function resolveLabel(obj: any): string {
    const label = (genericModel.value?.getLabel?.(obj) ?? '').trim()
    if (label) return label
    if (!obj?.id) return ''
    const created = obj.createdAt
        ? DateTime.fromJSDate(new Date(obj.createdAt)).toLocaleString(DateTime.DATE_MED)
        : ''
    return created ? `#${obj.id} · ${created}` : `#${obj.id}`
}

const deleteLabel = computed(() => resolveLabel(editingObj.value))

// per-row expand state for the (truncated) relation Name column
const expandedRelationNames = ref(new Set<string>())
function relationKey(item: any): string {
    return `${item?.model}-${item?.id}`
}
function isRelationNameExpanded(item: any): boolean {
    return expandedRelationNames.value.has(relationKey(item))
}
function toggleRelationName(item: any) {
    const key = relationKey(item)
    const next = new Set(expandedRelationNames.value)
    next.has(key) ? next.delete(key) : next.add(key)
    expandedRelationNames.value = next
}

const tab = ref('protecting')
const deleteLoading = ref(false)
const loadError = ref<null | 'notfound' | 'error'>(null)

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

/**
 * load data for the selected object
 */
function loadObject() {
    genericModel.value.retrieve(Number(props.id)).then(obj => {
        editingObj.value = obj
        title.value = t('DeleteSomething', {item: `${t(genericModel.value.model.localizationKey)} ${resolveLabel(editingObj.value)}`})
    }).catch(err => {
        // a missing object must render a clean not-found state, not the delete
        // form for a phantom object (delete-page analog of RecipeViewPage)
        if (err.response?.status == 404) {
            loadError.value = 'notfound'
        } else {
            loadError.value = 'error'
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        }
    })
}

/**
 * delete the selected object and redirect to model list if successfull
 */
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

/**
 * reload all related endpoints
 * @param cache if reload should occur using cached data or not
 */
function reloadAll(cache: boolean = true) {
    // only advanced-delete models expose apiXProtectingList/CascadingList/NullingList;
    // calling them for others (Space, User, Group, ...) throws on mount
    if (!genericModel.value.model.isAdvancedDelete) return
    loadProtected({page: 1, itemsPerPage: pageSize.value}, cache)
    loadCascading({page: 1, itemsPerPage: pageSize.value}, cache)
    loadNulling({page: 1, itemsPerPage: pageSize.value}, cache)
}

/**
 * load all objects protecting the selected object from being deleted
 * @param options VDataTableUpdateOptions
 * @param cache if reload should occur using cached data or not
 */
function loadProtected(options: VDataTableUpdateOptions, cache: boolean = true) {
    protectingObjectsLoading.value = true
    genericModel.value.getDeleteProtecting({id: Number(props.id), page: options.page, pageSize: options.itemsPerPage, cache: cache}).then(r => {
        protectingObjects.value = r.results
        protectingObjectsCount.value = r.count
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        protectingObjectsLoading.value = false
    })
}

/**
 * load all objects that will cascade when the selected model is deleted
 * @param options VDataTableUpdateOptions
 * @param cache if reload should occur using cached data or not
 */
function loadCascading(options: VDataTableUpdateOptions, cache: boolean = true) {

    cascadingObjectsLoading.value = true
    genericModel.value.getDeleteCascading({id: Number(props.id), page: options.page, pageSize: options.itemsPerPage, cache: cache}).then(r => {
        cascadingObjects.value = r.results
        cascadingObjectsCount.value = r.count
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        cascadingObjectsLoading.value = false
    })

}

/**
 * load all objects that will be updated when the selected model is deleted
 * @param options VDataTableUpdateOptions
 * @param cache if reload should occur using cached data or not
 */
function loadNulling(options: VDataTableUpdateOptions, cache: boolean = true) {

    nullingObjectsLoading.value = true
    genericModel.value.getDeleteNulling({id: Number(props.id), page: options.page, pageSize: options.itemsPerPage, cache: cache}).then(r => {
        nullingObjects.value = r.results
        nullingObjectsCount.value = r.count
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        nullingObjectsLoading.value = false
    })

}

/**
 * generic model delete function to quickly delete related models
 * @param model
 * @param id
 */
function deleteRelated(model: EditorSupportedModels, id: number) {
    let genericModel = getGenericModelFromString(model, t)
    if (genericModel) {
        genericModel.destroy(id).then(() => {
            reloadAll(false)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        })
    }
}

</script>

<style scoped>
/* Relation Name column: full text on wide screens; on a phone, truncate to keep the
   table (incl. the Actions column) on screen, with click-to-expand to the full wrapped text. */
@media (max-width: 600px) {
    .relation-name {
        max-width: 90px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .relation-name.relation-name--expanded {
        white-space: normal;
        overflow: visible;
        word-break: break-word;
    }
}
</style>