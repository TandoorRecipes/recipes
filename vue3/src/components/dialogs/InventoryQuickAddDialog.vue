<template>
    <v-dialog v-model="dialog" max-width="400" persistent>
        <v-card>
            <v-closable-card-title :title="title" icon="$pantry" v-model="dialog" />

            <v-card-text class="pb-2">
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
                <v-btn variant="text" @click="cancel">{{ $t('Cancel') }}</v-btn>
                <v-btn
                    color="success"
                    prepend-icon="$pantry"
                    variant="flat"
                    :disabled="selectedLocationId == null || amount <= 0"
                    @click="confirm"
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
import type {Unit} from '@/openapi'

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

let resolvePromise: ((result: InventoryQuickAddResult | null) => void) | null = null

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

watch(dialog, (val) => {
    if (!val && resolvePromise) {
        resolvePromise(null)
        resolvePromise = null
    }
})

defineExpose({open})
</script>
