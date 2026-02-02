<template>
    <!-- Desktop: right navigation drawer -->
    <v-navigation-drawer
        v-if="!mobile"
        v-model="isOpen"
        location="right"
        :width="320"
        :permanent="isPinned && isOpen"
        :temporary="!isPinned"
    >
        <v-toolbar density="compact" flat>
            <v-toolbar-title class="text-subtitle-1">{{ $t('Settings') }}</v-toolbar-title>
            <v-spacer />
            <v-btn
                :icon="isPinned ? 'fa-solid fa-thumbtack' : 'fa-solid fa-thumbtack fa-rotate-90'"
                variant="plain"
                size="small"
                @click="isPinned = !isPinned"
            />
            <v-btn
                icon="fa-solid fa-times"
                variant="plain"
                size="small"
                @click="isOpen = false"
            />
        </v-toolbar>

        <v-tabs v-model="activeTab" density="compact">
            <v-tab value="filters">{{ $t('Filters') }}</v-tab>
            <v-tab value="settings">{{ $t('Settings') }}</v-tab>
        </v-tabs>

        <v-divider />

        <v-tabs-window v-model="activeTab">
            <v-tabs-window-item value="filters">
                <div class="pa-4 text-center text-medium-emphasis">
                    {{ $t('Filters') }} — coming soon
                </div>
            </v-tabs-window-item>

            <v-tabs-window-item value="settings">
                <div class="text-overline px-4 pt-3">{{ $t('Columns') }}</div>

                <div v-for="col in toggleableColumns" :key="col.key" class="d-flex align-center px-4 py-0">
                    <v-checkbox
                        :model-value="isColumnVisible(col.key)"
                        @update:model-value="toggleColumn(col.key)"
                        :label="$t(col.title)"
                        hide-details
                        density="compact"
                        class="flex-grow-1"
                    />
                    <v-btn-toggle
                        v-if="col.hasDisplayMode"
                        :model-value="getDisplayMode(col.key)"
                        @update:model-value="(val: any) => setDisplayMode(col.key, val)"
                        mandatory
                        density="compact"
                        class="ms-2"
                    >
                        <v-btn value="icon" size="x-small">
                            <v-icon size="small">fa-solid fa-icons</v-icon>
                        </v-btn>
                        <v-btn value="text" size="x-small">
                            <v-icon size="small">fa-solid fa-font</v-icon>
                        </v-btn>
                    </v-btn-toggle>
                </div>

                <v-divider class="my-2" />

                <div class="text-overline px-4 pt-2">{{ $t('Table') }}</div>
                <div class="px-4 py-1">
                    <v-switch
                        v-model="showColumnHeaders"
                        :label="$t('ShowColumnHeaders')"
                        color="primary"
                        hide-details
                        density="compact"
                    />
                </div>
            </v-tabs-window-item>
        </v-tabs-window>
    </v-navigation-drawer>

    <!-- Mobile: bottom sheet -->
    <v-bottom-sheet v-else v-model="isOpen" scrollable>
        <v-card>
            <v-card-title class="d-flex align-center">
                <span>{{ $t('Settings') }}</span>
                <v-spacer />
                <v-btn icon="fa-solid fa-times" variant="plain" size="small" @click="isOpen = false" />
            </v-card-title>

            <v-tabs v-model="activeTab" density="compact">
                <v-tab value="filters">{{ $t('Filters') }}</v-tab>
                <v-tab value="settings">{{ $t('Settings') }}</v-tab>
            </v-tabs>

            <v-divider />

            <v-card-text style="max-height: 60vh; overflow-y: auto;">
                <v-tabs-window v-model="activeTab">
                    <v-tabs-window-item value="filters">
                        <div class="pa-4 text-center text-medium-emphasis">
                            {{ $t('Filters') }} — coming soon
                        </div>
                    </v-tabs-window-item>

                    <v-tabs-window-item value="settings">
                        <div class="text-overline px-4 pt-3">{{ $t('Columns') }}</div>

                        <div v-for="col in toggleableColumns" :key="col.key" class="d-flex align-center px-4 py-0">
                            <v-checkbox
                                :model-value="isColumnVisible(col.key)"
                                @update:model-value="toggleColumn(col.key)"
                                :label="$t(col.title)"
                                hide-details
                                density="compact"
                                class="flex-grow-1"
                            />
                            <v-btn-toggle
                                v-if="col.hasDisplayMode"
                                :model-value="getDisplayMode(col.key)"
                                @update:model-value="(val: any) => setDisplayMode(col.key, val)"
                                mandatory
                                density="compact"
                                class="ms-2"
                            >
                                <v-btn value="icon" size="x-small">
                                    <v-icon size="small">fa-solid fa-icons</v-icon>
                                </v-btn>
                                <v-btn value="text" size="x-small">
                                    <v-icon size="small">fa-solid fa-font</v-icon>
                                </v-btn>
                            </v-btn-toggle>
                        </div>

                        <v-divider class="my-2" />

                        <div class="text-overline px-4 pt-2">{{ $t('Table') }}</div>
                        <div class="px-4 py-1">
                            <v-switch
                                v-model="showColumnHeaders"
                                :label="$t('ShowColumnHeaders')"
                                color="primary"
                                hide-details
                                density="compact"
                            />
                        </div>
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-card-text>
        </v-card>
    </v-bottom-sheet>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import {useDisplay} from 'vuetify'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
import type {Model, ModelTableHeaders} from '@/types/Models'

const props = defineProps<{
    modelValue: boolean
    model: Model
    allColumns: ModelTableHeaders[]
    isColumnVisible: (key: string) => boolean
    toggleColumn: (key: string) => void
    getDisplayMode: (key: string) => 'icon' | 'text'
    setDisplayMode: (key: string, mode: 'icon' | 'text') => void
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()

const {mobile} = useDisplay()
const deviceSettings = useUserPreferenceStore().deviceSettings

const settingsKey = computed(() => props.model.listSettings?.settingsKey ?? '')

// Drawer open/close
const isOpen = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
})

// Pin state (desktop only, persisted)
const isPinned = computed({
    get: () => {
        if (!settingsKey.value) return false
        return (deviceSettings as any)[`${settingsKey.value}_settingsPinned`] ?? false
    },
    set: (val: boolean) => {
        if (!settingsKey.value) return
        ;(deviceSettings as any)[`${settingsKey.value}_settingsPinned`] = val
    },
})

// Show column headers setting
const showColumnHeaders = computed({
    get: () => {
        if (!settingsKey.value) return true
        return (deviceSettings as any)[`${settingsKey.value}_showColumnHeaders`] ?? true
    },
    set: (val: boolean) => {
        if (!settingsKey.value) return
        ;(deviceSettings as any)[`${settingsKey.value}_showColumnHeaders`] = val
    },
})

// Active tab
const activeTab = ref('settings')

// Columns available for toggling (exclude name and action-menu types)
const toggleableColumns = computed(() => {
    return props.allColumns.filter(c => c.key !== 'name')
})
</script>
