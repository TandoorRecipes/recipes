<template>
    <v-navigation-drawer
        v-if="!mobile"
        v-model="isOpen"
        location="right"
        :width="320"
        :permanent="isPinned && isOpen"
        :temporary="!isPinned"
    >
        <v-toolbar density="compact" flat>
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

        <v-tabs v-model="currentTab" density="compact" grow>
            <v-tab value="filters">
                <v-icon start size="small">fa-solid fa-filter</v-icon>
                {{ $t('Filters') }}
            </v-tab>
            <v-tab value="settings">
                <v-icon start size="small">fa-solid fa-sliders</v-icon>
                {{ $t('Settings') }}
            </v-tab>
        </v-tabs>

        <v-divider />

        <settings-panel-tabs-content
            v-model:current-tab="currentTab"
            :toggleable-columns="toggleableColumns"
            :is-column-visible="isColumnVisible"
            :toggle-column="toggleColumn"
            :get-display-mode="getDisplayMode"
            :set-display-mode="setDisplayMode"
            v-model:show-column-headers="showColumnHeaders"
        />
    </v-navigation-drawer>

    <v-bottom-sheet v-else v-model="isOpen" scrollable>
        <v-card>
            <v-card-title class="d-flex align-center pa-0">
                <v-tabs v-model="currentTab" density="compact" grow>
                    <v-tab value="filters">
                        <v-icon start size="small">fa-solid fa-filter</v-icon>
                        {{ $t('Filters') }}
                    </v-tab>
                    <v-tab value="settings">
                        <v-icon start size="small">fa-solid fa-sliders</v-icon>
                        {{ $t('Settings') }}
                    </v-tab>
                </v-tabs>
                <v-btn icon="fa-solid fa-times" variant="plain" size="small" @click="isOpen = false" />
            </v-card-title>

            <v-divider />

            <v-card-text style="max-height: 60vh; overflow-y: auto;" class="pa-0">
                <settings-panel-tabs-content
                    v-model:current-tab="currentTab"
                    :toggleable-columns="toggleableColumns"
                    :is-column-visible="isColumnVisible"
                    :toggle-column="toggleColumn"
                    :get-display-mode="getDisplayMode"
                    :set-display-mode="setDisplayMode"
                    v-model:show-column-headers="showColumnHeaders"
                />
            </v-card-text>
        </v-card>
    </v-bottom-sheet>
</template>

<script setup lang="ts">
import {computed, PropType} from 'vue'
import {useDisplay} from 'vuetify'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
import type {Model, ModelTableHeaders} from '@/types/Models'
import SettingsPanelTabsContent from '@/components/model_list/SettingsPanelTabsContent.vue'

const props = defineProps({
    modelValue: {type: Boolean, required: true},
    activeTab: {type: String, default: 'settings'},
    model: {type: Object as PropType<Model>, required: true},
    allColumns: {type: Array as PropType<ModelTableHeaders[]>, required: true},
    isColumnVisible: {type: Function as PropType<(key: string) => boolean>, required: true},
    toggleColumn: {type: Function as PropType<(key: string) => void>, required: true},
    getDisplayMode: {type: Function as PropType<(key: string) => 'icon' | 'text'>, required: true},
    setDisplayMode: {type: Function as PropType<(key: string, mode: 'icon' | 'text') => void>, required: true},
})

const emit = defineEmits(['update:modelValue', 'update:activeTab'])

const currentTab = computed({
    get: () => props.activeTab,
    set: (val: string) => emit('update:activeTab', val),
})

const {mobile} = useDisplay()
const deviceSettings = useUserPreferenceStore().deviceSettings

const settingsKey = computed(() => props.model.listSettings?.settingsKey ?? '')

const isPinned = computed({
    get: () => {
        if (!settingsKey.value) return false
        return (deviceSettings as any)[`${settingsKey.value}_panelPinned`] ?? false
    },
    set: (val: boolean) => {
        if (!settingsKey.value) return
        ;(deviceSettings as any)[`${settingsKey.value}_panelPinned`] = val
    },
})

const isOpen = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
})

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

const toggleableColumns = computed(() => {
    return props.allColumns.filter(c => c.key !== 'name')
})
</script>
