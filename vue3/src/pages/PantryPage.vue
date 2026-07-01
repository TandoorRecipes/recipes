<template>


    <v-container>
        <v-row density="compact">
            <v-col>
                <v-card prepend-icon="$pantry" :title="$t('Pantry')">
                    <template #subtitle>
                        <div class="text-wrap">
                            {{ $t('PantryHelp') }}
                        </div>
                    </template>
                    <template #append>
                        <v-btn class="float-right" icon="$create" color="create" @click="bookingDialog = true; bookingMode = 'add';">
                        </v-btn>

                    </template>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6">
                                <model-select model="Food" v-model="food" hide-details></model-select>
                            </v-col>

                            <v-col cols="12" md="6">
                                <model-select model="InventoryLocation" v-model="inventoryLocation" hide-details></model-select>
                            </v-col>
                        </v-row>


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
                                <v-chip size="small" label color="warning" class="me-2" prepend-icon="fa-solid fa-barcode">{{ item.code }}</v-chip>
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
                                {{ item.inventoryLocation.name }} <i class="fa-solid fa-snowflake" v-if="item.inventoryLocation.isFreezer"></i>
                                <span class="text-body-2 text-disabled">
                                    <br/>
                                {{ item.subLocation }}
                                </span>
                            </template>
                            <template #item.action="{item}">
                                <v-btn-group divided border density="comfortable">
                                    <v-btn icon="fa-solid fa-clock-rotate-left" @click="entryLogDialog = true; entryLogEntry = item"></v-btn>
                                    <v-btn icon="fa-solid fa-minus" @click="bookingDialog = true; bookingMode = 'remove'; bookingEntry = item"></v-btn>
                                    <v-btn icon="fa-solid fa-arrow-right" @click="bookingDialog = true; bookingMode = 'move'; bookingEntry = item"></v-btn>
                                </v-btn-group>

                            </template>
                        </v-data-table-server>

                        <inventory-entry-log-dialog v-model="entryLogDialog" :inventory-entry="entryLogEntry"></inventory-entry-log-dialog>

                        <pantry-booking-dialog v-model="bookingDialog" :bookingMode="bookingMode" :inventoryEntryId="bookingEntry?.id"
                                               @update="loadItems({page: page, itemsPerPage: pageSize})"></pantry-booking-dialog>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>

</template>

<script setup lang="ts">

import {DateTime} from "luxon";
import {ingredientToString} from "@/utils/model_utils.ts";
import {ApiApi, ApiInventoryEntryListRequest, Food, Ingredient, InventoryEntry, InventoryLocation} from "@/openapi";
import {onMounted, PropType, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import InventoryEntryLogDialog from "@/components/dialogs/InventoryEntryLogDialog.vue";
import {VDataTableUpdateOptions} from "@/vuetify.ts";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import PantryBookingDialog from "@/components/dialogs/PantryBookingDialog.vue";
import ModelSelect from "@/components/inputs/ModelSelect.vue";

const {t} = useI18n()

// table
const tableLoading = ref(false)

const items = ref([] as InventoryEntry[])
const itemCount = ref(0)
const page = ref(1)
const pageSize = ref(useUserPreferenceStore().deviceSettings.general_tableItemsPerPage)

const tableHeaders = ref([
    {title: t('Code'), key: 'code'},
    {title: t('Food'), key: 'food'},
    {title: t('Expires'), key: 'expires',},
    {title: t('InventoryLocation'), key: 'inventoryLocation',},
    {title: 'Actions', key: 'action', align: 'end'},
])

const entryLogDialog = ref(false)
const entryLogEntry = ref<InventoryEntry | null>(null)

const bookingDialog = ref(false)
const bookingMode = ref('move')
const bookingEntry = ref<InventoryEntry | null>(null)

const food = ref<Food | undefined>(undefined)
const inventoryLocation = ref<InventoryLocation | undefined>(undefined)

watch(food, () => {
    loadItems({page: 1, itemsPerPage: pageSize.value})
})

watch(inventoryLocation, () => {
    loadItems({page: 1, itemsPerPage: pageSize.value})
})

/**
 * load inventory data based on current props
 */
function loadItems(options: VDataTableUpdateOptions) {
    let api = new ApiApi()

    let parameters = {} as ApiInventoryEntryListRequest

    if (food.value) {
        parameters.foodId = food.value.id!
    }
    if (inventoryLocation.value) {
        parameters.inventoryLocationId = inventoryLocation.value.id!
    }

    tableLoading.value = true

    page.value = options.page
    pageSize.value = options.itemsPerPage

    parameters.page = options.page
    parameters.pageSize = options.itemsPerPage

    api.apiInventoryEntryList(parameters).then((r: any) => {
        items.value = r.results
        itemCount.value = r.count
    }).catch((err: any) => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        tableLoading.value = false
    })

}

</script>

<style scoped>

</style>