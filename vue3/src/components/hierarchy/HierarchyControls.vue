<template>
    <div class="pa-4">
        <!-- Parent + Remove Parent (tightly grouped) -->
        <v-label class="text-overline text-medium-emphasis d-block mb-2">
            {{ $t('Parent') }}
        </v-label>
        <model-select
            :model="model"
            v-model="setParentObj"
            allow-create
            :disabled="operating"
            density="compact"
            hide-details
        >
            <template #append>
                <v-btn
                    color="primary"
                    icon="$save"
                    size="small"
                    :disabled="!setParentObj || operating"
                    :aria-label="$t('Save')"
                    @click="onSetParent"
                />
            </template>
        </model-select>
        <v-btn
            color="warning"
            variant="outlined"
            prepend-icon="fa-solid fa-link-slash"
            size="small"
            class="mt-1 mb-6"
            style="width: calc(100% - 56px);"
            :disabled="operating"
            data-testid="remove-parent-btn"
            @click="confirmRemoveParent = true"
        >
            {{ $t('RemoveParent') }}
        </v-btn>

        <!-- Add Child -->
        <v-label class="text-overline text-medium-emphasis d-block mb-2">
            {{ $t('AddChild') }}
        </v-label>
        <model-select
            :model="model"
            v-model="addChildObj"
            allow-create
            :disabled="operating"
            density="compact"
            class="mb-6"
        >
            <template #append>
                <v-btn
                    color="primary"
                    icon="$save"
                    size="small"
                    :disabled="!addChildObj || operating"
                    :aria-label="$t('Save')"
                    @click="onAddChild"
                />
            </template>
        </model-select>

        <!-- Merge -->
        <v-label class="text-overline text-medium-emphasis d-block mb-2">
            {{ $t('Merge') }}
        </v-label>
        <model-select
            :model="model"
            v-model="mergeTargetObj"
            :disabled="operating"
            density="compact"
            class="mb-6"
        >
            <template #append>
                <v-btn
                    color="error"
                    variant="tonal"
                    icon="$save"
                    size="small"
                    :disabled="!mergeTargetObj || operating"
                    :aria-label="$t('Merge')"
                    @click="confirmMerge = true"
                />
            </template>
        </model-select>

        <!-- Navigation -->
        <div class="d-flex ga-2">
            <v-btn
                v-if="selectedItem.id !== editingItem.id"
                variant="tonal"
                prepend-icon="$edit"
                class="flex-1-1-0"
                :disabled="operating"
                :to="{ name: 'ModelEditPage', params: { model: model, id: selectedItem.id } }"
            >
                {{ $t('Edit') }}
            </v-btn>

            <v-btn
                v-if="searchLink"
                variant="tonal"
                prepend-icon="$search"
                class="flex-1-1-0"
                :to="searchLink"
                target="_blank"
            >
                {{ $t('Recipes') }}
            </v-btn>
        </div>

        <!-- Confirm Remove Parent dialog -->
        <v-dialog v-model="confirmRemoveParent" max-width="400" role="alertdialog">
            <v-card>
                <v-card-title>{{ $t('RemoveParent') }}</v-card-title>
                <v-card-text>
                    {{ $t('confirm_remove_parent') }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="confirmRemoveParent = false">{{ $t('Cancel') }}</v-btn>
                    <v-btn color="warning" @click="confirmRemoveParent = false; $emit('removeParent')">
                        {{ $t('RemoveParent') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Confirm Merge dialog -->
        <v-dialog v-model="confirmMerge" max-width="450" role="alertdialog">
            <v-card>
                <v-card-title>{{ $t('Merge') }}</v-card-title>
                <v-card-text>
                    {{ $t('confirm_merge') }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="confirmMerge = false">{{ $t('Cancel') }}</v-btn>
                    <v-btn color="error" @click="confirmMerge = false; onMerge()">
                        {{ $t('Merge') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue"
import type {EditorSupportedTypes, EditorSupportedModels} from "@/types/Models"
import ModelSelect from "@/components/inputs/ModelSelect.vue"

const props = defineProps<{
    selectedItem: EditorSupportedTypes
    editingItem: EditorSupportedTypes
    model: EditorSupportedModels
    operating: boolean
}>()

const emit = defineEmits<{
    addChild: [child: EditorSupportedTypes]
    setParent: [parent: EditorSupportedTypes]
    merge: [target: EditorSupportedTypes]
    removeParent: []
}>()

const addChildObj = ref<EditorSupportedTypes | undefined>(undefined)
const setParentObj = ref<EditorSupportedTypes | undefined>(undefined)
const mergeTargetObj = ref<EditorSupportedTypes | undefined>(undefined)
const confirmRemoveParent = ref(false)
const confirmMerge = ref(false)

const searchLink = computed(() => {
    if (props.model === 'Keyword') {
        return {name: 'SearchPage', query: {keywords: props.selectedItem.id!}}
    } else if (props.model === 'Food') {
        return {name: 'SearchPage', query: {foods: props.selectedItem.id!}}
    }
    return undefined
})

function onAddChild() {
    if (addChildObj.value) {
        emit('addChild', addChildObj.value)
        addChildObj.value = undefined
    }
}

function onSetParent() {
    if (setParentObj.value) {
        emit('setParent', setParentObj.value)
        setParentObj.value = undefined
    }
}

function onMerge() {
    if (mergeTargetObj.value) {
        emit('merge', mergeTargetObj.value)
        mergeTargetObj.value = undefined
    }
}

</script>
