<template>
    <v-container>
        <v-row dense>
            <v-col>
                <v-card prepend-icon="fa-solid fa-boxes-stacked" :title="$t('InventoryBooking')">
                    <template #subtitle>
                        <div class="text-wrap">
                            {{ $t('InventoryBookingHelp') }}
                        </div>
                    </template>
                    <template #append>
                        <v-btn class="float-right" icon="$pantry" color="create" :to="{name: 'PantryPage'}">
                        </v-btn>
                    </template>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" md="6">
                <v-card :loading="formLoading">
                    <v-card-title>
                        {{ $t('InventoryBooking') }}
                    </v-card-title>
                    <v-card-text>
                        <v-form>
                            <v-btn-toggle v-model="bookingMode" class="mb-5" border divided>
                                <v-btn value="add" prepend-icon="$create">{{ $t('Add') }}</v-btn>
                                <v-btn value="remove" prepend-icon="fa-solid fa-minus">{{ $t('Remove') }}</v-btn>
                                <v-btn value="move" prepend-icon="fa-solid fa-arrow-right">{{ $t('Move') }}</v-btn>
                            </v-btn-toggle>

                            <model-select model="InventoryEntry" v-model="inventoryEntry" v-if="['remove','move'].includes(bookingMode)"
                                          @update:modelValue="inventoryEntrySelected()">
                                <template #append>
                                    <v-btn icon="fa-solid fa-barcode"></v-btn>
                                </template>
                            </model-select>

                            <model-select model="Food" allow-create v-model="food"></model-select>

                            <model-select model="InventoryLocation" allow-create v-model="inventoryLocation" v-if="['add','move'].includes(bookingMode)"></model-select>
                            <v-text-field :label="$t('SubLocation')" :hint="$t('SubLocationHelp')" v-model="subLocation" v-if="['add','move'].includes(bookingMode)"></v-text-field>

                            <v-number-input :label="$t('Amount')" :precision="2" v-model="amount"></v-number-input>
                            <model-select model="Unit" allow-create v-model="unit" v-if="['add'].includes(bookingMode)"></model-select>

                            <v-date-input :label="$t('Expires')" v-model="expires" v-if="['add'].includes(bookingMode)">
                                <template #append-inner>
                                    <v-btn variant="text" @click.stop="freezerExpiryDialog = true">
                                        <v-icon icon="fa-solid fa-snowflake"></v-icon>
                                        <freezer-expiry-dialog v-model:date="expires" v-model="freezerExpiryDialog"></freezer-expiry-dialog>
                                    </v-btn>
                                </template>
                            </v-date-input>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="warning" prepend-icon="$reset" @click="resetForm()">{{ $t('Reset') }}</v-btn>
                        <v-btn color="create" prepend-icon="$save" @click="save()">{{ $t('Save') }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

            <v-col cols="12" md="6">
                <v-card :loading="tableLoading">
                    <v-card-title>
                        {{ $t('Stock') }}
                        <v-btn class="float-right" prepend-icon="$pantry" variant="text" :to="{name: 'PantryPage'}">{{$t('Pantry')}}</v-btn>
                    </v-card-title>
                    <v-card-text>
                        <v-data-table-server
                            return-object
                            @update:options="loadItems"
                            :items="items"
                            :items-length="itemCount"
                            :loading="tableLoading"
                            :headers="tableHeaders"
                            :page="page"
                            :items-per-page="pageSize"
                            disable-sort
                        >
                            <template #item.code="{item}">
                                #{{ item.code }}
                            </template>
                            <template #item.food="{item}">
                                {{ ingredientToString({food: item.food, unit: item.unit, amount: item.amount} as Ingredient) }}
                            </template>
                            <template #item.expires="{item}">
                                <template v-if="item.expires ">
                                    <v-chip size="small" label :color="(item.expires < DateTime.now() ? 'error' : 'success')">
                                        {{ DateTime.fromJSDate(item.expires).toLocaleString(DateTime.DATE_MED) }}
                                    </v-chip>
                                </template>
                            </template>
                            <template #item.inventoryLocation="{ item }">
                                {{ item.inventoryLocation.name }}
                                <span class="text-body-2 text-disabled">
                                    <br/>
                                {{ item.subLocation }}
                                </span>
                            </template>
                            <template #item.action="{item}">
                                <v-btn density="compact" icon="fa-solid fa-clock-rotate-left" variant="plain" @click="entryLogDialog = true; entryLogEntry = item"></v-btn>
                                <v-btn density="compact" icon="fa-solid fa-minus" variant="plain"
                                       @click="bookingMode='remove'; inventoryEntry = item; inventoryEntrySelected()"></v-btn>
                                <v-btn density="compact" icon="fa-solid fa-arrow-right" variant="plain"
                                       @click="bookingMode='move'; inventoryEntry = item; inventoryEntrySelected()"></v-btn>
                            </template>
                        </v-data-table-server>
                    </v-card-text>
                </v-card>
            </v-col>

        </v-row>
    </v-container>

    <inventory-entry-log-dialog v-model="entryLogDialog" :inventory-entry="entryLogEntry"></inventory-entry-log-dialog>
</template>

<script setup lang="ts">

import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {computed, ref, watch} from "vue";
import {ApiApi, ApiInventoryEntryListRequest, Food, Ingredient, InventoryEntry, InventoryLocation, Unit} from "@/openapi";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import {VDateInput} from "vuetify/labs/VDateInput";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore.ts";
import {useI18n} from "vue-i18n";
import {VDataTableUpdateOptions} from "@/vuetify.ts";
import {DateTime} from "luxon";
import {ingredientToString} from "@/utils/model_utils.ts";
import FreezerExpiryDialog from "@/components/dialogs/FreezerExpiryDialog.vue";
import InventoryEntryLogDialog from "@/components/dialogs/InventoryEntryLogDialog.vue";

const {t} = useI18n()

// form
const formLoading = ref(false)
const freezerExpiryDialog = ref(false)

const bookingMode = ref('add')
const food = ref<Food | null>(null)
const inventoryEntry = ref<InventoryEntry | null>(null)
const inventoryLocation = ref<InventoryLocation | null>(null)
const subLocation = ref<string | undefined>('')
const amount = ref<number | undefined>(1)
const unit = ref<Unit | undefined | null>(useUserPreferenceStore().defaultUnitObj)
const expires = ref<Date | undefined>(undefined)

// table
const tableLoading = ref(false)

const items = ref([] as InventoryEntry[])
const itemCount = ref(0)
const page = ref(1)
const pageSize = ref(10)

// general
const entryLogDialog = ref(false)
const entryLogEntry = ref<InventoryEntry | null>(null)

const tableHeaders = ref([
    {title: t('Code'), key: 'code'},
    {title: t('Food'), key: 'food'},
    {title: t('Expires'), key: 'expires',},
    {title: t('InventoryLocation'), key: 'inventoryLocation',},
    {title: 'Actions', key: 'action', align: 'end'},
])

watch([() => food.value, () => inventoryLocation.value], () => {
    loadItems({page: 1, itemsPerPage: 10})
})


/**
 * save form depending on selected booking mode
 */
function save() {
    if (bookingMode.value == 'add') {
        addInventory()
    } else if (bookingMode.value == 'remove') {
        removeInventory()
    } else if (bookingMode.value == 'move') {
        moveInventory()
    }
}

/**
 * add new inventory entry
 */
function addInventory() {
    let api = new ApiApi()
    formLoading.value = true

    let inventoryEntry = {
        food: food.value,
        inventoryLocation: inventoryLocation.value,
        subLocation: subLocation.value,
        amount: amount.value,
        unit: unit.value,
        expires: expires.value
    } as InventoryEntry

    api.apiInventoryEntryCreate({inventoryEntry: inventoryEntry}).then(r => {
        useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
        resetForm(false)
        loadItems({page: 1, itemsPerPage: 10})
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    }).finally(() => {
        formLoading.value = false
    })
}

/**
 * subtract amount from inventory entry and save to DB
 */
function removeInventory() {
    let api = new ApiApi()

    if (inventoryEntry.value != null) {
        formLoading.value = true

        if (inventoryEntry.value.amount != undefined && amount.value != undefined) {
            inventoryEntry.value.amount = Math.max(inventoryEntry.value.amount - amount.value, 0)
        }

        api.apiInventoryEntryUpdate({id: inventoryEntry.value.id!, inventoryEntry: inventoryEntry.value}).then(r => {
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
            resetForm(false)
            loadItems({page: 1, itemsPerPage: 10})
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        }).finally(() => {
            formLoading.value = false
        })
    }
}

function moveInventory() {
    let api = new ApiApi()

    if (inventoryEntry.value != null) {
        formLoading.value = true
        let changed = false

        if (inventoryLocation.value != null && inventoryEntry.value.inventoryLocation != inventoryLocation.value) {
            inventoryEntry.value.inventoryLocation = inventoryLocation.value
            changed = true
        }
        if (subLocation.value != null && inventoryEntry.value.subLocation != subLocation.value) {
            inventoryEntry.value.subLocation = subLocation.value
            changed = true
        }

        if (changed) {
            api.apiInventoryEntryUpdate({id: inventoryEntry.value.id!, inventoryEntry: inventoryEntry.value}).then(r => {
                useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
                resetForm(false)
                loadItems({page: 1, itemsPerPage: 10})
            }).catch(err => {
                useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
            }).finally(() => {
                formLoading.value = false
            })
        }

    }
}


/**
 * reset form to default values
 */
function resetForm(resetFood: boolean = true) {
    if (resetFood) {
        food.value = null
    }
    inventoryEntry.value = null
    inventoryLocation.value = null
    subLocation.value = ''
    amount.value = 1
    unit.value = useUserPreferenceStore().defaultUnitObj
    expires.value = undefined
}

/**
 * when an inventory entry is selected, fill form with values from inventory entry
 */
function inventoryEntrySelected() {
    if (inventoryEntry.value) {
        food.value = inventoryEntry.value.food
        unit.value = inventoryEntry.value.unit
        //inventoryLocation.value = inventoryEntry.value.inventoryLocation
        //subLocation.value = inventoryEntry.value.subLocation
        amount.value = inventoryEntry.value.amount
        //expires.value = inventoryEntry.value.expires
    }
}

/**
 * load inventory data based on current props
 */
function loadItems(options: VDataTableUpdateOptions) {
    let api = new ApiApi()

    let parameters = {} as ApiInventoryEntryListRequest

    if (food.value == null && inventoryLocation.value == null) {
        items.value = []
        itemCount.value = 0
    } else {
        if (food.value) {
            parameters.foodId = food.value.id!
        }
        if (inventoryLocation.value) {
            parameters.inventoryLocationId = inventoryLocation.value.id!
        }

        tableLoading.value = true

        page.value = options.page
        pageSize.value = options.itemsPerPage

        api.apiInventoryEntryList(parameters).then((r: any) => {
            items.value = r.results
            itemCount.value = r.count
        }).catch((err: any) => {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        }).finally(() => {
            tableLoading.value = false
        })
    }
}

</script>

<style scoped>

</style>