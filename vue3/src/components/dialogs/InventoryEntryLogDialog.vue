<template>
    <v-dialog max-width="900" v-model="dialog" activator="model">
        <v-card>

            <v-closable-card-title v-model="dialog" icon="fa-solid fa-clock-rotate-left" :title="$t('History')"></v-closable-card-title>

            <v-card-text>
                <inventory-entry-log-table :inventoryEntry="props.inventoryEntry"></inventory-entry-log-table>

            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {PropType} from "vue";
import {InventoryEntry} from "@/openapi";

import InventoryEntryLogTable from "@/components/tables/InventoryEntryLogTable.vue";


const props = defineProps({
    inventoryEntry: {type: {} as PropType<InventoryEntry>, required: false},
})

const dialog = defineModel<boolean>()

</script>

<style scoped>

</style>