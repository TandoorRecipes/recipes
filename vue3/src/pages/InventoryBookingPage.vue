<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <v-card prepend-icon="fa-solid fa-boxes-stacked" :title="$t('Inventory Booking')">
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" sm="8">
                                <model-select model="Food" v-model="selectedFood" :label="$t('Food')" can-clear></model-select>
                            </v-col>
                            <v-col cols="12" sm="4">
                                <v-text-field
                                    v-model="searchCode"
                                    :label="$t('Inventory Code')"
                                    append-inner-icon="fa-solid fa-barcode"
                                    @click:append-inner="lookupCode"
                                    @keyup.enter="lookupCode"
                                    persistent-hint
                                    :hint="$t('Enter code to find food')"
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
                    <v-tabs v-model="activeTab" color="primary" :disabled="loading">
                        <v-tab value="add">{{ $t('Add') }}</v-tab>
                        <v-tab value="remove">{{ $t('Remove') }}</v-tab>
                        <v-tab value="move">{{ $t('Move') }}</v-tab>
                    </v-tabs>

                    <v-card-text>
                        <v-window v-model="activeTab">
                            <v-window-item value="add">
                                <v-form @submit.prevent="addStock" :disabled="loading">
                                    <v-row>
                                        <v-col cols="8">
                                            <v-text-field v-model.number="booking.amount" :label="$t('Amount')" type="number" step="any" required></v-text-field>
                                        </v-col>
                                        <v-col cols="4">
                                            <model-select model="Unit" v-model="booking.unit" :label="$t('Unit')"></model-select>
                                        </v-col>
                                    </v-row>
                                    <model-select model="InventoryLocation" v-model="booking.location" :label="$t('Location')" required></model-select>
                                    <v-text-field v-model="booking.subLocation" :label="$t('Sub_location')"></v-text-field>
                                    <v-row>
                                        <v-col cols="12" sm="6">
                                            <v-text-field v-model="booking.expires" :label="$t('Expires')" type="date"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <v-text-field v-model="booking.expiresFrozen" :label="$t('Expires_Frozen')" type="date">
                                                <template #append-inner>
                                                    <v-btn icon="fa-solid fa-snowflake" size="small" variant="text" @click="openFreezerDialog"></v-btn>
                                                </template>
                                            </v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-btn color="success" block type="submit" :loading="loading">{{ $t('Add Stock') }}</v-btn>
                                </v-form>
                            </v-window-item>

                            <v-window-item value="remove">
                                <v-form @submit.prevent="removeStock" :disabled="loading">
                                    <v-select
                                        v-model="booking.sourceEntry"
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
                                        v-model="booking.sourceEntry"
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
                                {{ entry.storageLocationName }}
                                <div v-if="entry.subLocation" class="text-caption">{{ entry.subLocation }}</div>
                            </td>
                            <td>{{ entry.amount }} {{ entry.unitName }}</td>
                            <td>{{ entry.expires ? new Date(entry.expires).toLocaleDateString() : '-' }}</td>
                            <td>{{ entry.expiresFrozen ? new Date(entry.expiresFrozen).toLocaleDateString() : '-' }}</td>
                            <td class="text-end text-no-wrap">
                                <v-btn icon="fa-solid fa-clock-rotate-left" size="x-small" variant="text" color="info" @click="openLogDialog(entry)" :title="$t('History')"></v-btn>
                                <v-btn icon="fa-solid fa-minus" size="x-small" variant="text" color="error" @click="preSelectEntry(entry, mode='remove')" :title="$t('Remove')"></v-btn>
                                <v-btn icon="fa-solid fa-arrows-rotate" size="x-small" variant="text" color="primary" @click="preSelectEntry(entry, mode='move')" :title="$t('Move')"></v-btn>
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

        <v-row v-if="selectedFood || loading">
            <v-col cols="12">
                <v-card :title="$t('Food History')" prepend-icon="fa-solid fa-clipboard-list" :loading="loading">
                    <v-table>
                        <thead>
                        <tr>
                            <th>{{ $t('Date') }}</th>
                            <th>{{ $t('Type') }}</th>
                            <th>{{ $t('Entry') }}</th>
                            <th>{{ $t('Change') }}</th>
                            <th>{{ $t('Location') }}</th>
                            <th>{{ $t('Note') }}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="log in foodLogs" :key="log.id">
                            <td>{{ new Date(log.createdAt).toLocaleString() }}</td>
                            <td>{{ $t(log.bookingType || 'add') }}</td>
                            <td>
                                <v-btn variant="text" size="small" @click="openLogDialogFromId(log.entry)">
                                    #{{ log.entry }}
                                </v-btn>
                            </td>
                            <td>
                                <div class="d-flex align-center">
                                    <span class="text-error">{{ log.oldAmount }}</span>
                                    <v-icon icon="fa-solid fa-arrow-right" size="x-small" class="mx-2"></v-icon>
                                    <span class="text-success">{{ log.newAmount }}</span>
                                </div>
                            </td>
                            <td>
                                <div v-if="log.oldStorageLocation !== log.newStorageLocation">
                                    {{ locationMap.get(log.oldStorageLocation) }}
                                    <v-icon icon="fa-solid fa-arrow-right" size="x-small" class="mx-1"></v-icon>
                                    {{ locationMap.get(log.newStorageLocation) }}
                                </div>
                                <div v-else>
                                    {{ locationMap.get(log.newStorageLocation) }}
                                </div>
                            </td>
                            <td>{{ log.note }}</td>
                        </tr>
                        <tr v-if="foodLogs.length === 0 && !loading">
                            <td colspan="6" class="text-center text-disabled">{{ $t('No history available') }}</td>
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
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import FreezerExpiryDialog from "@/components/dialogs/FreezerExpiryDialog.vue";
import InventoryEntryLogDialog from "@/components/dialogs/InventoryEntryLogDialog.vue";
import { ApiApi, InventoryEntry, Food, InventoryLocation, InventoryLog } from "@/openapi";
import { useMessageStore, MessageType } from "@/stores/MessageStore";

const { t } = useI18n();
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

const booking = ref({
    amount: 1,
    unit: null,
    location: null,
    subLocation: '',
    expires: '',
    expiresFrozen: '',
    sourceEntry: null as any,
    targetLocation: null as any,
    targetSubLocation: '',
});

const fetchStock = async () => {
    if (!selectedFood.value?.id) {
        currentStock.value = [];
        foodLogs.value = [];
        return;
    }

    loading.value = true;
    try {
        // use food filter from api to only get entries for selected food
        const response = await api.apiInventoryEntryList({ food: selectedFood.value.id, empty: false });
        
        const entries = response.results || [];
        
        // Fetch units to show names (locations are already in locationMap)
        const unitsResponse = await api.apiUnitList({ limit: 1000 });
        const units = unitsResponse.results || [];
        const unitMap = new Map(units.map(u => [u.id, u.name]));

        currentStock.value = entries.map(e => ({
            ...e,
            storageLocationName: locationMap.value.get(e.storageLocation) || e.storageLocation,
            unitName: unitMap.get(e.unit) || '',
            displayName: `${locationMap.value.get(e.storageLocation)} ${e.subLocation ? '(' + e.subLocation + ')' : ''} - ${e.amount} ${unitMap.get(e.unit) || ''}`
        }));

        await fetchFoodLogs();
    } catch (e) {
        console.error(e);
        messageStore.addMessage(MessageType.ERROR, t('Error fetching stock'));
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    // Pre-fetch locations
    try {
        const locationsResponse = await api.apiInventoryLocationList({ limit: 1000 });
        const locations = locationsResponse.results || [];
        locationMap.value = new Map(locations.map(l => [l.id!, l.name]));
    } catch (e) {
        console.error(e);
    }

    // Handle query params
    if (route.query.code) {
        searchCode.value = route.query.code as string;
        await lookupCode();
    } else if (route.query.food) {
        try {
            loading.value = true;
            const foodId = parseInt(route.query.food as string);
            if (!isNaN(foodId)) {
                selectedFood.value = await api.apiFoodRetrieve({ id: foodId });
            }
        } catch (e) {
            console.error(e);
        } finally {
            loading.value = false;
        }
    }
});

watch(selectedFood, () => {
    fetchStock();
    if (selectedFood.value) {
        // Try to default unit from food if it has one (TBD if Food has default unit)
        // booking.value.unit = selectedFood.value.defaultUnit; 
    } else {
        searchCode.value = '';
    }
});

const openLogDialog = (entry: InventoryEntry) => {
    selectedEntry.value = entry;
    logDialog.value = true;
};

const openLogDialogFromId = async (entryId: number) => {
    try {
        const entry = await api.apiInventoryEntryRetrieve({ id: entryId });
        openLogDialog(entry);
    } catch (e) {
        messageStore.addMessage(MessageType.ERROR, t('Error fetching entry details'));
    }
};

const addStock = async () => {
    if (!selectedFood.value?.id || !booking.value.location) return;
    loading.value = true;
    try {
        await api.apiInventoryEntryCreate({
            inventoryEntry: {
                food: selectedFood.value.id,
                amount: booking.value.amount,
                unit: booking.value.unit?.id || booking.value.unit,
                storageLocation: booking.value.location?.id || booking.value.location,
                subLocation: booking.value.subLocation,
                expires: booking.value.expires ? new Date(booking.value.expires) : undefined,
                expiresFrozen: booking.value.expiresFrozen ? new Date(booking.value.expiresFrozen) : undefined,
            }
        });
        messageStore.addMessage(MessageType.SUCCESS, t('Stock added successfully'));
        fetchStock();
        // Reset some booking fields
        booking.value.amount = 1;
        fetchFoodLogs();
    } catch (e) {
        messageStore.addMessage(MessageType.ERROR, t('Error adding stock'));
    } finally {
        loading.value = false;
    }
};

const removeStock = async () => {
    if (!booking.value.sourceEntry) return;
    loading.value = true;
    try {
        const entry = booking.value.sourceEntry;
        const newAmount = entry.amount - booking.value.amount;
        
        if (newAmount < 0) {
            messageStore.addMessage(MessageType.ERROR, t('Cannot remove more than available'));
            return;
        }

        await api.apiInventoryEntryPartialUpdate({
            id: entry.id,
            patchedInventoryEntry: {
                amount: newAmount
            }
        });
        
        messageStore.addMessage(MessageType.SUCCESS, t('Stock removed successfully'));
        fetchStock();
        fetchFoodLogs();
    } catch (e) {
        messageStore.addMessage(MessageType.ERROR, t('Error removing stock'));
    } finally {
        loading.value = false;
    }
};

const moveStock = async () => {
    if (!booking.value.sourceEntry || !booking.value.targetLocation) return;
    loading.value = true;
    try {
        const entry = booking.value.sourceEntry;
        const moveAmount = booking.value.amount;

        if (moveAmount > entry.amount) {
            messageStore.addMessage(MessageType.ERROR, t('Cannot move more than available'));
            return;
        }

        // 1. Decrease source
        await api.apiInventoryEntryPartialUpdate({
            id: entry.id,
            patchedInventoryEntry: {
                amount: entry.amount - moveAmount
            }
        });

        // 2. Add to target (or create new)
        // For simplicity, we just create a new entry at target. 
        // In a more advanced version, we'd check if an entry with same food/unit/location/expiry exists.
        await api.apiInventoryEntryCreate({
            inventoryEntry: {
                food: selectedFood.value!.id!,
                amount: moveAmount,
                unit: entry.unit,
                storageLocation: booking.value.targetLocation?.id || booking.value.targetLocation,
                subLocation: booking.value.targetSubLocation,
                expires: entry.expires ? new Date(entry.expires) : undefined,
                expiresFrozen: entry.expiresFrozen ? new Date(entry.expiresFrozen) : undefined,
            }
        });

        messageStore.addMessage(MessageType.SUCCESS, t('Stock moved successfully'));
        fetchStock();
        fetchFoodLogs();
    } catch (e) {
        messageStore.addMessage(MessageType.ERROR, t('Error moving stock'));
    } finally {
        loading.value = false;
    }
};

const fetchFoodLogs = async () => {
    if (!selectedFood.value?.id) return;
    try {
        const logsResponse = await api.apiInventoryLogList({ food: selectedFood.value.id });
        foodLogs.value = logsResponse.results || [];
    } catch (e) {
        console.error(e);
    }
};

const openFreezerDialog = () => {
    freezerDialog.value = true;
};

const applyFreezerExpiry = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    booking.value.expiresFrozen = date.toISOString().split('T')[0];
};

const lookupCode = async () => {
    if (!searchCode.value) return;
    
    loading.value = true;
    try {
        const response = await api.apiInventoryEntryList({ code: searchCode.value, empty: true });
        if (response.results && response.results.length > 0) {
            const entry = response.results[0];
            if (entry.food) {
                // Fetch food details to set selectedFood
                const food = await api.apiFoodRetrieve({ id: entry.food });
                selectedFood.value = food;
                // fetchStock will be triggered by watch(selectedFood)
            }
        } else {
            messageStore.addMessage(MessageType.INFO, t('No entries found for this code'));
        }
    } catch (e) {
        console.error(e);
        messageStore.addMessage(MessageType.ERROR, t('Error looking up code'));
    } finally {
        loading.value = false;
    }
};

const preSelectEntry = (entry: any, mode: 'remove' | 'move') => {
    activeTab.value = mode;
    booking.value.sourceEntry = entry;
    booking.value.amount = entry.amount;
};

</script>
