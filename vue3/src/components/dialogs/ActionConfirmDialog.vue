<template>
    <v-dialog v-model="dialog" max-width="450" persistent>
        <v-card :loading="loading">
            <v-closable-card-title :title="title" :icon="icon" v-model="dialog" />

            <v-card-text v-if="message" class="pb-2 text-body-1">{{ message }}</v-card-text>

            <v-card-text v-if="selectOptions.length > 0" class="pb-2">
                <v-select
                    v-model="selectedValue"
                    :items="selectOptions"
                    item-title="label"
                    item-value="value"
                    :aria-label="title"
                    variant="outlined"
                    density="compact"
                    hide-details
                />
            </v-card-text>

            <v-list v-if="entries.length > 0" density="compact" class="py-0">
                <v-list-item v-if="selectable && selectableEntryIds.length > 1" @click="toggleAll">
                    <template #prepend>
                        <v-checkbox-btn
                            :model-value="allSelected"
                            @update:model-value="toggleAll"
                            density="compact"
                            class="me-2"
                        />
                    </template>
                    <v-list-item-title class="text-body-2 font-italic">{{ allSelected ? $t('DeselectAll') : $t('SelectAll') }}</v-list-item-title>
                </v-list-item>
                <v-divider v-if="selectable && selectableEntryIds.length > 1" />
                <v-list-item v-for="(entry, idx) in entries" :key="idx" :prepend-icon="selectable ? undefined : entry.icon">
                    <template v-if="selectable" #prepend>
                        <v-checkbox-btn
                            :model-value="entry.id != null && selectedIds.has(entry.id)"
                            @update:model-value="toggleEntry(entry)"
                            density="compact"
                            class="me-2"
                        />
                    </template>
                    <v-list-item-title>{{ entry.text }}</v-list-item-title>
                    <v-list-item-subtitle v-if="entry.subtext">{{ entry.subtext }}</v-list-item-subtitle>
                </v-list-item>
            </v-list>

            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="cancel">{{ $t('Cancel') }}</v-btn>
                <v-btn
                    :color="confirmColor"
                    :prepend-icon="confirmIcon"
                    :disabled="(selectOptions.length > 0 && selectedValue == null) || (selectable && selectedIds.size === 0)"
                    variant="flat"
                    @click="confirm"
                >
                    {{ confirmLabel }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import VClosableCardTitle from '@/components/dialogs/VClosableCardTitle.vue'

export type ActionConfirmEntry = {
    id?: number,
    text: string,
    subtext?: string,
    icon?: string,
}

const dialog = ref(false)
const loading = ref(false)
const title = ref('')
const icon = ref('')
const message = ref('')
const entries = ref<ActionConfirmEntry[]>([])
const selectOptions = ref<{value: number | string, label: string}[]>([])
const selectedValue = ref<number | string | null>(null)
const confirmLabel = ref('')
const confirmColor = ref('primary')
const confirmIcon = ref('')
const selectable = ref(false)
const selectedIds = ref<Set<number>>(new Set())
const selectedEntryIds = computed(() => [...selectedIds.value])
const selectableEntryIds = computed(() => entries.value.filter(e => e.id != null).map(e => e.id!))
const allSelected = computed(() => selectableEntryIds.value.length > 0 && selectableEntryIds.value.every(id => selectedIds.value.has(id)))

let resolvePromise: ((confirmed: boolean) => void) | null = null

function open(opts: {
    title: string,
    icon?: string,
    message?: string,
    entries?: ActionConfirmEntry[],
    loading?: boolean,
    selectable?: boolean,
    confirmLabel: string,
    confirmColor?: string,
    confirmIcon?: string,
}): Promise<boolean> {
    title.value = opts.title
    icon.value = opts.icon ?? ''
    message.value = opts.message ?? ''
    entries.value = opts.entries ?? []
    selectOptions.value = []
    selectedValue.value = null
    selectable.value = opts.selectable ?? false
    selectedIds.value = new Set((opts.entries ?? []).filter(e => e.id != null).map(e => e.id!))
    loading.value = opts.loading ?? false
    confirmLabel.value = opts.confirmLabel
    confirmColor.value = opts.confirmColor ?? 'primary'
    confirmIcon.value = opts.confirmIcon ?? ''
    dialog.value = true

    return new Promise((resolve) => {
        // Resolve any pending promise from a prior open() call to prevent leak
        resolvePromise?.(false)
        resolvePromise = resolve
    })
}

function setEntries(newEntries: ActionConfirmEntry[]) {
    entries.value = newEntries
    if (selectable.value) {
        selectedIds.value = new Set(newEntries.filter(e => e.id != null).map(e => e.id!))
    }
    loading.value = false
}

function setSelectOptions(opts: {value: number | string, label: string}[]) {
    selectOptions.value = opts
    selectedValue.value = null
    loading.value = false
}

function toggleAll() {
    if (allSelected.value) {
        selectedIds.value = new Set()
    } else {
        selectedIds.value = new Set(selectableEntryIds.value)
    }
}

function toggleEntry(entry: ActionConfirmEntry) {
    if (entry.id == null) return
    const next = new Set(selectedIds.value)
    if (next.has(entry.id)) {
        next.delete(entry.id)
    } else {
        next.add(entry.id)
    }
    selectedIds.value = next
}

function confirm() {
    dialog.value = false
    resolvePromise?.(true)
    resolvePromise = null
}

function cancel() {
    dialog.value = false
    resolvePromise?.(false)
    resolvePromise = null
}

// Resolve as false if dialog closes without confirm/cancel (e.g. via title X button)
watch(dialog, (val) => {
    if (!val && resolvePromise) {
        resolvePromise(false)
        resolvePromise = null
    }
})

defineExpose({open, setEntries, setSelectOptions, selectedValue, selectedEntryIds})
</script>
