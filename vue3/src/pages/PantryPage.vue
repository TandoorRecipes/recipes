<template>


    <v-container>
        <v-row dense>
            <v-col>
                <v-card prepend-icon="$pantry" :title="$t('Pantry')">
                    <template #subtitle>
                        <div class="text-wrap">
                            {{ $t('PantryHelp') }}
                        </div>
                    </template>
                    <template #append>
                        <v-btn class="float-right" icon="$create" color="create" @click="bookingMode = 'add'; bookingDialog = true">
                        </v-btn>
                        <pantry-booking-dialog v-model="bookingDialog" bookingMode="add"></pantry-booking-dialog>
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


                        <inventory-entry-table :food="food" :inventory-location="inventoryLocation"></inventory-entry-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>

</template>

<script setup lang="ts">

import InventoryEntryTable from "@/components/display/InventoryEntryTable.vue";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {ref} from "vue";
import {Food, InventoryLocation} from "@/openapi";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import PantryBookingDialog from "@/components/dialogs/PantryBookingDialog.vue";

const food = ref<Food | undefined>(undefined)
const inventoryLocation = ref<InventoryLocation | undefined>(undefined)

const bookingDialog = ref(false)

</script>

<style scoped>

</style>