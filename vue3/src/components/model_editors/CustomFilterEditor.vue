<template>
    <model-editor-base
        :loading="loading"
        :dialog="dialog"
        @save="saveObject"
        @delete="deleteObject"
        @close="emit('close'); editingObjChanged = false"
        :is-update="isUpdate()"
        :is-changed="editingObjChanged"
        :model-class="modelClass"
        :object-name="editingObjName()"
        :editing-object="editingObj">
        <v-card-text>
            <v-form :disabled="loading">
                <v-text-field :label="$t('Name')" v-model="editingObj.name" />

                <v-select
                    :label="$t('Type')"
                    v-model="(editingObj as any).type"
                    :items="filterTypes"
                    item-title="label"
                    item-value="value"
                />

                <model-select
                    model="User"
                    v-model="editingObj.shared"
                    :label="$t('Shared')"
                    mode="tags"
                />

                <v-select
                    :label="$t('SortOrder')"
                    v-model="sortOrder"
                    :items="sortOptions"
                    item-title="title"
                    item-value="value"
                    clearable
                />

                <v-alert v-if="hasUnknownKeys" type="info" variant="tonal" density="compact" class="mt-1">
                    {{ $t('SavedSearchFilterCriteriaNotice') }}
                </v-alert>
            </v-form>
        </v-card-text>
    </model-editor-base>
</template>

<script setup lang="ts">
import {computed, onMounted, PropType, watch} from "vue"
import {CustomFilter} from "@/openapi"
import {useI18n} from "vue-i18n"
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions"
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue"
import ModelSelect from "@/components/inputs/ModelSelect.vue"
import {RECIPE_SORT_DEFS, RECIPE_FILTER_DEFS} from "@/composables/modellist/RecipeList"
import {recognizedSearchKeys} from "@/utils/savedSearchBlob"

const {t} = useI18n()

const props = defineProps({
    item: {type: {} as PropType<CustomFilter>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<CustomFilter>, required: false, default: {} as CustomFilter},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<CustomFilter>('CustomFilter', emit)

const filterTypes = computed(() => [
    {value: 'RECIPE', label: t('Recipe')},
    {value: 'FOOD', label: t('Food')},
    {value: 'KEYWORD', label: t('Keyword')},
])

// Recipe sort options (each in its natural direction). The full sort control on
// the search page can pick any direction; this dialog offers a quick default.
const sortOptions = computed(() => RECIPE_SORT_DEFS.map(d => ({
    value: d.defaultDescending ? `-${d.key}` : d.key,
    title: t(d.labelKey),
})))

// Read/write the sort_order stored inside the opaque `search` blob.
const sortOrder = computed<string>({
    get: () => ((editingObj.value as any)?.search?.sort_order as string) ?? '',
    set: (v: string) => {
        if (!editingObj.value) return
        const search = {...((editingObj.value as any).search ?? {})}
        if (v) search.sort_order = v
        else delete search.sort_order
        ;(editingObj.value as any).search = search
        editingObjChanged.value = true
    },
})

// The dialog can only edit name/type/shared/sort — surface a notice when the
// saved search also holds filter fields not shown here (they're preserved).
const hasUnknownKeys = computed(() => {
    const search = (editingObj.value as any)?.search
    if (!search || typeof search !== 'object') return false
    const recognized = recognizedSearchKeys(RECIPE_FILTER_DEFS)  // incl. query/version/sort_order + range expansions + aliases
    return Object.keys(search).some(k => !recognized.has(k))
})

defineExpose({sortOrder, hasUnknownKeys})

watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})

onMounted(() => {
    initializeEditor()
})

function initializeEditor() {
    setupState(props.item, props.itemId, {itemDefaults: props.itemDefaults})
}
</script>

<style scoped></style>
