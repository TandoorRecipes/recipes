<template>
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
                <v-btn icon="fa-solid fa-minus" :to="{name: 'InventoryBookingPage', query: {inventoryEntryId: item.id, bookingMode: 'remove'}}"></v-btn>
                <v-btn icon="fa-solid fa-arrow-right" :to="{name: 'InventoryBookingPage', query: {inventoryEntryId: item.id, bookingMode: 'move'}}"></v-btn>
            </v-btn-group>

        </template>
    </v-data-table-server>

    <inventory-entry-log-dialog v-model="entryLogDialog" :inventory-entry="entryLogEntry"></inventory-entry-log-dialog>
</template>

<script setup lang="ts">

import {DateTime} from "luxon";
import {ingredientToString} from "@/utils/model_utils.ts";
import {ApiApi, ApiInventoryEntryListRequest, Ingredient, InventoryEntry, InventoryLocation} from "@/openapi";
import {PropType, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import InventoryEntryLogDialog from "@/components/dialogs/InventoryEntryLogDialog.vue";
import {VDataTableUpdateOptions} from "@/vuetify.ts";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

const {t} = useI18n()

const props = defineProps({
    food: {type: Object as PropType<Ingredient | null>, required: false},
    inventoryLocation: {type: Object as PropType<InventoryLocation | null>, required: false},
})

watch(props, () => {
    loadItems({page: 1, itemsPerPage: useUserPreferenceStore().deviceSettings.general_tableItemsPerPage})
})

// table
const tableLoading = ref(false)

const items = ref([] as InventoryEntry[])
const itemCount = ref(0)
const page = ref(1)
const pageSize = ref(useUserPreferenceStore().deviceSettings.general_tableItemsPerPage)

const entryLogDialog = ref(false)
const entryLogEntry = ref<InventoryEntry | null>(null)

const tableHeaders = ref([
    {title: t('Code'), key: 'code'},
    {title: t('Food'), key: 'food'},
    {title: t('Expires'), key: 'expires',},
    {title: t('InventoryLocation'), key: 'inventoryLocation',},
    {title: 'Actions', key: 'action', align: 'end'},
])


/**
 * load inventory data based on current props
 */
function loadItems(options: VDataTableUpdateOptions) {
    let api = new ApiApi()

    let parameters = {} as ApiInventoryEntryListRequest

    if (props.food) {
        parameters.foodId = props.food.id!
    }
    if (props.inventoryLocation) {
        parameters.inventoryLocationId = props.inventoryLocation.id!
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
</script>


<style scoped>

</style>