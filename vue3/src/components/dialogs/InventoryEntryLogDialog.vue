<template>
    <v-dialog max-width="900" v-model="dialog" activator="model">
        <v-card>

            <v-closable-card-title v-model="dialog" icon="fa-solid fa-clock-rotate-left" :title="$t('History')"></v-closable-card-title>

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

                    <template #item.bookingType="{item}">
                        <v-chip label color="success" v-if="item.bookingType == 'add'">{{ $t('Added') }}</v-chip>
                        <v-chip label color="error" v-else-if="item.bookingType == 'remove'">{{ $t('Removed') }}</v-chip>
                        <v-chip label color="info" v-else>{{ $t('Moved') }}</v-chip>
                    </template>

                    <template #item.createdAt="{item}">
                        {{ DateTime.fromJSDate(item.createdAt).toLocaleString(DateTime.DATETIME_MED) }}
                    </template>

                    <template #item.amount="{item}">
                        <template v-if="item.oldAmount != item.newAmount">
                            {{ item.oldAmount }} <i class="fa-solid fa-arrow-right"></i> {{ item.newAmount }}
                        </template>
                        <template v-else>
                            {{ item.newAmount }}
                        </template>
                    </template>

                    <template #item.location="{item}">
                        <template v-if="item.oldInventoryLocation.id != item.newInventoryLocation.id">
                            {{ item.oldInventoryLocation.name }} <i class="fa-solid fa-arrow-right"></i> {{ item.newInventoryLocation.name }}
                        </template>
                        <template v-else>
                            {{ item.newInventoryLocation.name }}
                        </template>
                    </template>

                </v-data-table-server>

            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {PropType, ref} from "vue";
import {ApiApi, Ingredient, InventoryEntry, InventoryLog} from "@/openapi";
import {DateTime} from "luxon";
import {ingredientToString} from "@/utils/model_utils.ts";
import {VDataTableUpdateOptions} from "@/vuetify.ts";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const props = defineProps({
    inventoryEntry: {type: {} as PropType<InventoryEntry>, required: false}
})

const dialog = defineModel<boolean>()

const tableLoading = ref(false)

const items = ref([] as InventoryLog[])
const itemCount = ref(0)
const page = ref(1)
const pageSize = ref(10)

const tableHeaders = ref([
    {title: t('BookingType'), key: 'bookingType'},
    {title: t('Date'), key: 'createdAt'},
    {title: t('Amount'), key: 'amount'},
    {title: t('InventoryLocation'), key: 'location'},
])


/**
 * load logs for selected inventory entry
 */
function loadItems(options: VDataTableUpdateOptions) {
    let api = new ApiApi()

    tableLoading.value = true

    page.value = options.page
    pageSize.value = options.itemsPerPage

    api.apiInventoryLogList({entryId: props.inventoryEntry.id!}).then((r: any) => {
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