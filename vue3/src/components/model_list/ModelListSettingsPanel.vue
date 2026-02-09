<template>
    <!-- Desktop: right navigation drawer -->
    <v-navigation-drawer
        v-if="!mobile"
        v-model="isOpen"
        location="right"
        :width="320"
        temporary
    >
        <v-toolbar density="compact" flat>
            <v-toolbar-title class="text-subtitle-1">{{ $t('Settings') }}</v-toolbar-title>
            <v-spacer />
            <v-btn
                icon="fa-solid fa-times"
                variant="plain"
                size="small"
                @click="isOpen = false"
            />
        </v-toolbar>

        <v-divider />

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
    </v-navigation-drawer>

    <!-- Mobile: bottom sheet -->
    <v-bottom-sheet v-else v-model="isOpen" scrollable>
        <v-card>
            <v-card-title class="d-flex align-center">
                <span>{{ $t('Settings') }}</span>
                <v-spacer />
                <v-btn icon="fa-solid fa-times" variant="plain" size="small" @click="isOpen = false" />
            </v-card-title>

            <v-divider />

            <v-card-text style="max-height: 60vh; overflow-y: auto;">
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
            </v-card-text>
        </v-card>
    </v-bottom-sheet>
</template>

<script setup lang="ts">
import {computed, PropType} from 'vue'
import {useDisplay} from 'vuetify'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
import type {Model, ModelTableHeaders} from '@/types/Models'

const props = defineProps({
    modelValue: {type: Boolean, required: true},
    model: {type: Object as PropType<Model>, required: true},
    allColumns: {type: Array as PropType<ModelTableHeaders[]>, required: true},
    isColumnVisible: {type: Function as PropType<(key: string) => boolean>, required: true},
    toggleColumn: {type: Function as PropType<(key: string) => void>, required: true},
    getDisplayMode: {type: Function as PropType<(key: string) => 'icon' | 'text'>, required: true},
    setDisplayMode: {type: Function as PropType<(key: string, mode: 'icon' | 'text') => void>, required: true},
})

const emit = defineEmits(['update:modelValue'])

const {mobile} = useDisplay()
const deviceSettings = useUserPreferenceStore().deviceSettings

const settingsKey = computed(() => props.model.listSettings?.settingsKey ?? '')

// Drawer open/close
const isOpen = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
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

// Columns available for toggling (exclude name and action-menu types)
const toggleableColumns = computed(() => {
    return props.allColumns.filter(c => c.key !== 'name')
})
</script>
