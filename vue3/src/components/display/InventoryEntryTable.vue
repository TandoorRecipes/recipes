<template>

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
import PantryBookingDialog from "@/components/dialogs/PantryBookingDialog.vue";

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


const bookingDialog = ref(false)
const bookingMode = ref('move')
const bookingEntry = ref<InventoryEntry | null>(null)

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

    // Pass pagination to the server — without these the API returns every row and
    // v-data-table-server (server mode) renders them all while the footer shows a
    // page range, so the items-per-page control appears to do nothing (R09-3).
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