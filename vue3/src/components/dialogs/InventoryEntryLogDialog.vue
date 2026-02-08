<template>
    <v-dialog max-width="900px" v-model="dialog">
        <v-card :loading="loading">
            <v-closable-card-title v-model="dialog" :title="$t('Inventory Log History')" icon="fa-solid fa-clipboard-list"></v-closable-card-title>

            <v-card-text>
                <v-table>
                    <thead>
                    <tr>
                        <th>{{ $t('Date') }}</th>
                        <th>{{ $t('Type') }}</th>
                        <th>{{ $t('Change') }}</th>
                        <th>{{ $t('Location') }}</th>
                        <th>{{ $t('Note') }}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="log in logs" :key="log.id">
                        <td>{{ new Date(log.createdAt).toLocaleString() }}</td>
                        <td>{{ $t(log.bookingType || 'add') }}</td>
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
                    <tr v-if="logs.length === 0 && !loading">
                        <td colspan="5" class="text-center text-disabled">{{ $t('No log entries found') }}</td>
                    </tr>
                    </tbody>
                </v-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="dialog = false">{{ $t('Close') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ApiApi, InventoryLog, InventoryEntry } from "@/openapi";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";

const props = defineProps<{
    modelValue: boolean;
    entry: InventoryEntry | null;
}>();

const emit = defineEmits(['update:modelValue']);

const dialog = ref(props.modelValue);
const loading = ref(false);
const logs = ref<InventoryLog[]>([]);
const locationMap = ref(new Map<number, string>());

const api = new ApiApi();

watch(() => props.modelValue, (val) => {
    dialog.value = val;
    if (val && props.entry) {
        fetchLogs();
    }
});

watch(dialog, (val) => {
    emit('update:modelValue', val);
});

const fetchLogs = async () => {
    if (!props.entry?.id) return;
    loading.value = true;
    try {
        const response = await api.apiInventoryLogList({ entry: props.entry.id });
        logs.value = response.results || [];

        // Fetch locations to show names
        const locationsResponse = await api.apiInventoryLocationList({ limit: 1000 });
        const locations = locationsResponse.results || [];
        locationMap.value = new Map(locations.map(l => [l.id!, l.name]));
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

</script>
