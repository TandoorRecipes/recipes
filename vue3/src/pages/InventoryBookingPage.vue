<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <v-card prepend-icon="fa-solid fa-boxes-stacked" :title="$t('InventoryBooking')">
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" sm="6">
                                <model-select model="Food" v-model="selectedFood" append-to-body can-clear></model-select>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model="searchCode"
                                    :label="$t('InventoryCode')"
                                    append-inner-icon="$search"
                                    @click:append-inner="lookupCode"
                                    @keyup.enter="lookupCode"
                                    persistent-hint
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row v-if="selectedFood || loading">
            <v-col cols="12" md="6">
                <v-card :loading="loading">
                    <v-tabs v-model="activeTab" :disabled="loading" grow>
                        <v-tab value="add">{{ $t('Add') }}</v-tab>
                        <v-tab value="remove">{{ $t('Remove') }}</v-tab>
                        <v-tab value="move">{{ $t('Move') }}</v-tab>
                    </v-tabs>

                    <v-card-text>
                        <v-window v-model="activeTab">
                            <v-window-item value="add">
                                <v-form @submit.prevent="addStock" :disabled="loading">
                                    <v-row>
                                        <v-col cols="6">
                                            <v-text-field v-model.number="booking.amount" :label="$t('Amount')" type="number"></v-text-field>
                                        </v-col>
                                        <v-col cols="6">
                                            <model-select model="Unit" v-model="booking.unit"></model-select>
                                        </v-col>
                                    </v-row>
                                    <model-select model="InventoryLocation" v-model="booking.inventoryLocation"></model-select>
                                    <v-text-field v-model="booking.subLocation" :label="$t('SubLocation')" :hint="$t('SubLocationHelp')" persistent-hint clearable></v-text-field>

                                    <v-text-field v-model="booking.expiresFrozen" :label="$t('Expires_Frozen')" type="date" v-if="booking.inventoryLocation && booking.inventoryLocation.isFreezer">
                                        <template #append-inner>
                                            <v-btn icon="fa-solid fa-snowflake" size="small" variant="text" @click="openFreezerDialog"></v-btn>
                                        </template>
                                    </v-text-field>
                                    <v-text-field v-model="booking.expires" :label="$t('Expires')" type="date" v-else></v-text-field>

                                    <v-btn color="success" block type="submit" :loading="loading">{{ $t('Add Stock') }}</v-btn>
                                </v-form>
                            </v-window-item>

                            <v-window-item value="remove">
                                <v-form @submit.prevent="removeStock" :disabled="loading">
                                    <v-select
                                        v-model="selectedStockEntry"
                                        :items="currentStock"
                                        item-title="displayName"
                                        item-value="id"
                                        :label="$t('Select Stock Entry')"
                                        required
                                        return-object
                                    ></v-select>
                                    <v-text-field v-model.number="booking.amount" :label="$t('Amount to Remove')" type="number" step="any" required></v-text-field>
                                    <v-btn color="error" block type="submit" :loading="loading">{{ $t('Remove Stock') }}</v-btn>
                                </v-form>
                            </v-window-item>

                            <v-window-item value="move">
                                <v-form @submit.prevent="moveStock" :disabled="loading">
                                    <v-select
                                        v-model="selectedStockEntry"
                                        :items="currentStock"
                                        item-title="displayName"
                                        item-value="id"
                                        :label="$t('Source Stock Entry')"
                                        required
                                        return-object
                                    ></v-select>
                                    <v-text-field v-model.number="booking.amount" :label="$t('Amount to Move')" type="number" step="any" required></v-text-field>
                                    <model-select model="InventoryLocation" v-model="booking.targetLocation" :label="$t('Target Location')" required></model-select>
                                    <v-text-field v-model="booking.targetSubLocation" :label="$t('Target Sub Location')"></v-text-field>
                                    <v-btn color="primary" block type="submit" :loading="loading">{{ $t('Move Stock') }}</v-btn>
                                </v-form>
                            </v-window-item>
                        </v-window>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="6">
                <v-card :title="$t('Current Stock')" :loading="loading">
                    <v-table>
                        <thead>
                        <tr>
                            <th>{{ $t('Location') }}</th>
                            <th>{{ $t('Amount') }}</th>
                            <th>{{ $t('Expires') }}</th>
                            <th>{{ $t('Expires_Frozen') }}</th>
                            <th class="text-end">{{ $t('Actions') }}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="entry in currentStock" :key="entry.id">
                            <td>
                                {{ entry.inventoryLocationName }}
                                <div v-if="entry.subLocation" class="text-caption">{{ entry.subLocation }}</div>
                            </td>
                            <td>{{ entry.amount }} {{ entry.unitName }}</td>
                            <td>{{ entry.expires ? new Date(entry.expires).toLocaleDateString() : '-' }}</td>
                            <td>{{ entry.expiresFrozen ? new Date(entry.expiresFrozen).toLocaleDateString() : '-' }}</td>
                            <td class="text-end text-no-wrap">
                                <v-btn icon="fa-solid fa-clock-rotate-left" size="x-small" variant="text" color="info" @click="openLogDialog(entry)" :title="$t('History')"></v-btn>
                                <v-btn icon="fa-solid fa-minus" size="x-small" variant="text" color="error" @click="preSelectEntry(entry, mode='remove')"
                                       :title="$t('Remove')"></v-btn>
                                <v-btn icon="fa-solid fa-arrows-rotate" size="x-small" variant="text" color="primary" @click="preSelectEntry(entry, mode='move')"
                                       :title="$t('Move')"></v-btn>
                            </td>
                        </tr>
                        <tr v-if="currentStock.length === 0">
                            <td colspan="5" class="text-center text-disabled">{{ $t('No stock available') }}</td>
                        </tr>
                        </tbody>
                    </v-table>
                </v-card>
            </v-col>
        </v-row>

        <freezer-expiry-dialog v-model="freezerDialog" @select="applyFreezerExpiry"></freezer-expiry-dialog>
        <inventory-entry-log-dialog v-model="logDialog" :entry="selectedEntry"></inventory-entry-log-dialog>
    </v-container>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import {useI18n} from 'vue-i18n';
import {useRoute} from 'vue-router';

import FreezerExpiryDialog from "@/components/dialogs/FreezerExpiryDialog.vue";
import InventoryEntryLogDialog from "@/components/dialogs/InventoryEntryLogDialog.vue";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {ApiApi, Food, InventoryEntry, InventoryLocation, InventoryLog} from "@/openapi";
import {MessageType, useMessageStore} from "@/stores/MessageStore";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

const {t} = useI18n();
const route = useRoute();
const messageStore = useMessageStore();

const api = new ApiApi();

const selectedFood = ref<Food | null>(null);
const searchCode = ref('');
const currentStock = ref<any[]>([]);
const foodLogs = ref<InventoryLog[]>([]);
const locationMap = ref(new Map<number, string>());
const loading = ref(false);
const activeTab = ref('add');
const freezerDialog = ref(false);
const logDialog = ref(false);
const selectedEntry = ref<InventoryEntry | null>(null);
const selectedStockEntry = ref<any | null>(null);

const booking = ref<any>({
    amount: 1,
    unit: useUserPreferenceStore().defaultUnitObj,
    inventoryLocation: {} as InventoryLocation,
    targetLocation: {} as InventoryLocation,
    targetSubLocation: '',
});

const fetchFoodLogs = () => {
    if (!selectedFood.value?.id) return;

    api.apiInventoryLogList({foodId: selectedFood.value.id}).then(r => {
        foodLogs.value = r.results || [];
    }).catch(e => {
        console.error(e);
    });
};

const fetchStock = () => {
    if (!selectedFood.value?.id) {
        currentStock.value = [];
        foodLogs.value = [];
        return;
    }

    loading.value = true;
    api.apiInventoryEntryList({foodId: selectedFood.value.id, empty: false}).then(async r => {
        const entries = r.results || [];

        // Fetch units to show names (locations are already in locationMap)
        const unitsResponse = await api.apiUnitList({limit: 1000});
        const units = unitsResponse.results || [];
        const unitMap = new Map(units.map(u => [u.id, u.name]));

        currentStock.value = entries.map(e => ({
            ...e,
            inventoryLocationName: locationMap.value.get(e.inventoryLocation) || e.inventoryLocation,
            unitName: unitMap.get(e.unit) || '',
            displayName: `${locationMap.value.get(e.inventoryLocation)} ${e.subLocation ? '(' + e.subLocation + ')' : ''} - ${e.amount} ${unitMap.get(e.unit) || ''}`
        }));

        fetchFoodLogs();
    }).catch(e => {
        console.error(e);
        messageStore.addMessage(MessageType.ERROR, t('Error fetching stock'));
    }).finally(() => {
        loading.value = false;
    });
};

const lookupCode = () => {
    if (!searchCode.value) return;

    loading.value = true;
    api.apiInventoryEntryList({code: searchCode.value, empty: true}).then(r => {
        if (r.results && r.results.length > 0) {
            const entry = r.results[0];
            if (entry.food) {
                // Fetch food details to set selectedFood
                api.apiFoodRetrieve({id: entry.food}).then(food => {
                    selectedFood.value = food;
                });
            }
        } else {
            messageStore.addMessage(MessageType.INFO, t('No entries found for this code'));
        }
    }).catch(e => {
        console.error(e);
        messageStore.addMessage(MessageType.ERROR, t('Error looking up code'));
    }).finally(() => {
        loading.value = false;
    });
};

const addStock = () => {
    if (!selectedFood.value?.id || !booking.value.inventoryLocation) return;
    loading.value = true;
    api.apiInventoryEntryCreate({
        inventoryEntry: {
            food: (selectedFood.value as any)?.id || selectedFood.value,
            amount: booking.value.amount,
            unit: (booking.value.unit as any)?.id || booking.value.unit,
            inventoryLocation: (booking.value.inventoryLocation as any)?.id || booking.value.inventoryLocation,
            subLocation: booking.value.subLocation,
            expires: booking.value.expires ? new Date(booking.value.expires) : undefined,
            expiresFrozen: booking.value.expiresFrozen ? new Date(booking.value.expiresFrozen) : undefined,
        }
    }).then(() => {
        messageStore.addMessage(MessageType.SUCCESS, t('Stock added successfully'));
        fetchStock();
        // Reset some booking fields
        booking.value.amount = 1;
        fetchFoodLogs();
    }).catch(() => {
        messageStore.addMessage(MessageType.ERROR, t('Error adding stock'));
    }).finally(() => {
        loading.value = false;
    });
};

const removeStock = () => {
    if (!selectedStockEntry.value) return;
    loading.value = true;

    const entry = selectedStockEntry.value;
    const newAmount = entry.amount - booking.value.amount;

    if (newAmount < 0) {
        messageStore.addMessage(MessageType.ERROR, t('Cannot remove more than available'));
        loading.value = false;
        return;
    }

    api.apiInventoryEntryPartialUpdate({
        id: entry.id,
        patchedInventoryEntry: {
            amount: newAmount
        }
    }).then(() => {
        messageStore.addMessage(MessageType.SUCCESS, t('Stock removed successfully'));
        fetchStock();
        fetchFoodLogs();
    }).catch(() => {
        messageStore.addMessage(MessageType.ERROR, t('Error removing stock'));
    }).finally(() => {
        loading.value = false;
    });
};

const moveStock = () => {
    if (!selectedStockEntry.value || !booking.value.targetLocation) return;
    loading.value = true;

    const entry = selectedStockEntry.value;
    const moveAmount = booking.value.amount;

    if (moveAmount > entry.amount) {
        messageStore.addMessage(MessageType.ERROR, t('Cannot move more than available'));
        loading.value = false;
        return;
    }

    // 1. Decrease source
    api.apiInventoryEntryPartialUpdate({
        id: entry.id,
        patchedInventoryEntry: {
            amount: entry.amount - moveAmount
        }
    }).then(() => {
        // 2. Add to target (or create new)
        api.apiInventoryEntryCreate({
            inventoryEntry: {
                food: (selectedFood.value as any)?.id || selectedFood.value,
                amount: moveAmount,
                unit: (entry.unit as any)?.id || entry.unit,
                inventoryLocation: (booking.value.targetLocation as any)?.id || booking.value.targetLocation,
                subLocation: booking.value.targetSubLocation,
                expires: entry.expires ? new Date(entry.expires) : undefined,
                expiresFrozen: entry.expiresFrozen ? new Date(entry.expiresFrozen) : undefined,
            }
        }).then(() => {
            messageStore.addMessage(MessageType.SUCCESS, t('Stock moved successfully'));
            fetchStock();
            fetchFoodLogs();
        }).catch(() => {
            messageStore.addMessage(MessageType.ERROR, t('Error moving stock'));
        }).finally(() => {
            loading.value = false;
        });
    }).catch(() => {
        messageStore.addMessage(MessageType.ERROR, t('Error moving stock'));
        loading.value = false;
    });
};

const openLogDialog = (entry: any) => {
    selectedEntry.value = entry;
    logDialog.value = true;
};

const openLogDialogFromId = (entryId: number) => {
    api.apiInventoryEntryRetrieve({id: entryId}).then(entry => {
        openLogDialog(entry);
    }).catch(() => {
        messageStore.addMessage(MessageType.ERROR, t('Error fetching entry details'));
    });
};

const openFreezerDialog = () => {
    freezerDialog.value = true;
};

const applyFreezerExpiry = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    booking.value.expiresFrozen = date.toISOString().split('T')[0];
};

const preSelectEntry = (entry: any, mode: 'remove' | 'move') => {
    activeTab.value = mode;
    selectedStockEntry.value = entry;
    booking.value.amount = entry.amount;
};

onMounted(() => {
    // Pre-fetch locations
    api.apiInventoryLocationList({limit: 1000}).then(r => {
        const locations = r.results || [];
        locationMap.value = new Map(locations.map(l => [l.id!, l.name]));
    }).catch(e => {
        console.error(e);
    });

    // Handle query params
    if (route.query.code) {
        searchCode.value = route.query.code as string;
        lookupCode();
    } else if (route.query.food) {
        const foodId = parseInt(route.query.food as string);
        if (!isNaN(foodId)) {
            loading.value = true;
            api.apiFoodRetrieve({id: foodId}).then(food => {
                selectedFood.value = food;
            }).catch(e => {
                console.error(e);
            }).finally(() => {
                loading.value = false;
            });
        }
    }
});

watch(selectedFood, () => {
    fetchStock();
    selectedStockEntry.value = null;
    if (!selectedFood.value) {
        searchCode.value = '';
    }
});

</script>
