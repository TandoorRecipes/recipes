<template>
    <v-dialog v-model="dialog" max-width="400" persistent>
        <v-card>
            <v-closable-card-title :title="title" icon="$pantry" v-model="dialog" />

            <v-card-text class="pb-2">
                <!-- Manage mode: existing entries list -->
                <template v-if="isManageMode">
                    <div v-if="loadingEntries" class="d-flex justify-center py-2">
                        <v-progress-circular indeterminate size="24" width="2" />
                    </div>
                    <v-list v-else-if="existingEntries.length" density="compact" class="mb-3 pa-0">
                        <v-list-item
                            v-for="entry in existingEntries"
                            :key="entry.id"
                            class="px-0"
                            density="compact"
                        >
                            <v-list-item-title class="text-body-2">
                                {{ entryLabel(entry) }}
                            </v-list-item-title>
                            <template #append>
                                <v-btn
                                    icon
                                    density="compact"
                                    variant="plain"
                                    color="error"
                                    :loading="deletingId === entry.id"
                                    @click="handleDeleteEntry(entry.id!)"
                                >
                                    <v-icon icon="fa-solid fa-trash" size="small" />
                                </v-btn>
                            </template>
                        </v-list-item>
                    </v-list>
                    <p v-else class="text-body-2 text-medium-emphasis mb-3">{{ $t('NoEntries') }}</p>
                    <v-divider class="mb-3" />
                </template>

                <v-select
                    v-model="selectedLocationId"
                    :items="locationItems"
                    item-title="label"
                    item-value="value"
                    :label="$t('InventoryLocation')"
                    :aria-label="$t('InventoryLocation')"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="mb-3"
                />

                <v-number-input
                    v-model="amount"
                    :label="$t('Amount')"
                    control-variant="split"
                    :precision="2"
                    :min="0"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="mb-3"
                />

                <model-select
                    model="Unit"
                    v-model="selectedUnit"
                    :label="$t('Unit')"
                    density="compact"
                    can-clear
                    hide-details
                    append-to-body
                />
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="isManageMode ? closeManage() : cancel()">
                    {{ $t(isManageMode ? 'Close' : 'Cancel') }}
                </v-btn>
                <v-btn
                    color="success"
                    prepend-icon="$pantry"
                    variant="flat"
                    :disabled="selectedLocationId == null || amount <= 0"
                    :loading="addingEntry"
                    @click="isManageMode ? handleManageAdd() : confirm()"
                >
                    {{ $t('Add') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import VClosableCardTitle from '@/components/dialogs/VClosableCardTitle.vue'
import ModelSelect from '@/components/inputs/ModelSelect.vue'
import {ApiApi, type InventoryEntry, type Unit} from '@/openapi'
import {ErrorMessageType, useMessageStore} from '@/stores/MessageStore'

export type InventoryQuickAddResult = {
    locationId: number
    amount: number
    unit: Unit | null
}

type LocationItem = {value: number, label: string}

const dialog = ref(false)
const title = ref('')
const locationItems = ref<LocationItem[]>([])
const selectedLocationId = ref<number | null>(null)
const amount = ref(1)
const selectedUnit = ref<Unit | null>(null)

// Quick-add mode state
let resolvePromise: ((result: InventoryQuickAddResult | null) => void) | null = null

// Manage mode state
const isManageMode = ref(false)
const manageFoodId = ref<number | null>(null)
const existingEntries = ref<InventoryEntry[]>([])
const loadingEntries = ref(false)
const addingEntry = ref(false)
const deletingId = ref<number | null>(null)
let manageResolve: ((result: {hasEntries: boolean}) => void) | null = null

function entryLabel(entry: InventoryEntry): string {
    const parts: string[] = []
    if (entry.amount) parts.push(String(entry.amount))
    if (entry.unit?.name) parts.push(entry.unit.name)
    if (entry.inventoryLocation?.name) parts.push(`· ${entry.inventoryLocation.name}`)
    return parts.join(' ')
}

// ── Quick-add mode ────────────────────────────────────────────────────────────

function open(opts: {
    title: string,
    locations: LocationItem[],
    defaultLocationId?: number | null,
    amount?: number,
    unit?: Unit | null,
}): Promise<InventoryQuickAddResult | null> {
    title.value = opts.title
    locationItems.value = opts.locations
    selectedLocationId.value = opts.defaultLocationId ?? (opts.locations.length === 1 ? opts.locations[0].value : null)
    amount.value = opts.amount ?? 1
    selectedUnit.value = opts.unit ?? null
    isManageMode.value = false
    dialog.value = true

    return new Promise((resolve) => {
        resolvePromise?.(null)
        resolvePromise = resolve
    })
}

function confirm() {
    dialog.value = false
    resolvePromise?.({
        locationId: selectedLocationId.value!,
        amount: amount.value,
        unit: selectedUnit.value,
    })
    resolvePromise = null
}

function cancel() {
    dialog.value = false
    resolvePromise?.(null)
    resolvePromise = null
}

// ── Manage mode ───────────────────────────────────────────────────────────────

async function openManage(opts: {
    title: string,
    foodId: number,
    locations: LocationItem[],
    defaultLocationId?: number | null,
    amount?: number,
    unit?: Unit | null,
}): Promise<{hasEntries: boolean}> {
    title.value = opts.title
    locationItems.value = opts.locations
    selectedLocationId.value = opts.defaultLocationId ?? (opts.locations.length === 1 ? opts.locations[0].value : null)
    amount.value = opts.amount ?? 1
    selectedUnit.value = opts.unit ?? null
    isManageMode.value = true
    manageFoodId.value = opts.foodId
    existingEntries.value = []
    dialog.value = true

    loadingEntries.value = true
    try {
        const result = await new ApiApi().apiInventoryEntryList({foodId: opts.foodId, pageSize: 100})
        existingEntries.value = result.results ?? []
    } catch {
        existingEntries.value = []
    } finally {
        loadingEntries.value = false
    }

    return new Promise((resolve) => {
        manageResolve?.(resolveCurrentState())
        manageResolve = resolve
    })
}

function resolveCurrentState(): {hasEntries: boolean} {
    return {hasEntries: existingEntries.value.length > 0}
}

function closeManage() {
    dialog.value = false
    manageResolve?.(resolveCurrentState())
    manageResolve = null
    isManageMode.value = false
    manageFoodId.value = null
}

async function handleDeleteEntry(entryId: number) {
    deletingId.value = entryId
    try {
        await new ApiApi().apiInventoryEntryDestroy({id: entryId})
        existingEntries.value = existingEntries.value.filter(e => e.id !== entryId)
    } catch (err) {
        useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
    } finally {
        deletingId.value = null
    }
}

async function handleManageAdd() {
    if (selectedLocationId.value == null || amount.value <= 0 || !manageFoodId.value) return
    addingEntry.value = true
    try {
        const locationItem = locationItems.value.find(l => l.value === selectedLocationId.value)
        const entry = await new ApiApi().apiInventoryEntryCreate({
            inventoryEntry: {
                food: {id: manageFoodId.value, name: ''} as any,
                inventoryLocation: {id: selectedLocationId.value, name: locationItem?.label ?? ''} as any,
                unit: (selectedUnit.value ?? null) as any,
                amount: amount.value,
            },
        })
        existingEntries.value.push(entry)
        amount.value = 1
        selectedUnit.value = null
    } catch (err) {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    } finally {
        addingEntry.value = false
    }
}

watch(dialog, (val) => {
    if (val) return
    if (isManageMode.value) {
        manageResolve?.(resolveCurrentState())
        manageResolve = null
        isManageMode.value = false
    } else if (resolvePromise) {
        resolvePromise(null)
        resolvePromise = null
    }
})

defineExpose({open, openManage})
</script>
