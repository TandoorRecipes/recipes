<template>
    <v-card variant="outlined" class="d-flex align-center ga-2 pa-3 mb-1">
        <v-icon
            class="drag-handle flex-shrink-0"
            icon="fa-solid fa-grip-vertical"
            size="small"
            aria-label="Drag to reorder"
        />

        <div class="flex-grow-1 d-flex flex-column ga-1" style="min-height: 48px" @click.stop @mousedown.stop>
            <span class="text-body-2 font-weight-medium">{{ label }}</span>
            <span class="text-caption text-medium-emphasis">{{ description }}</span>

            <div v-if="MODEL_FOR_MODE[section.mode]" style="max-width: 280px">
                <model-select
                    :model="MODEL_FOR_MODE[section.mode] as string"
                    v-model="section._filterObj"
                    @update:model-value="section.filter_id = ($event as any)?.id"
                    density="compact"
                    hide-details
                    search-on-load
                    can-clear
                    append-to-body
                    :placeholder="t('any_random', {target: label})"
                />
            </div>
            <v-select
                v-else-if="section.mode === 'created_by'"
                v-model="section.filter_id"
                :items="availableUsers"
                item-title="label"
                item-value="value"
                density="compact"
                hide-details
                :placeholder="t('any_random', {target: t('User')})"
                clearable
                style="max-width: 280px"
            />
            <v-select
                v-else-if="section.mode === 'rating'"
                v-model="section.filter_id"
                :items="ratingOptions"
                item-title="label"
                item-value="value"
                density="compact"
                hide-details
                :placeholder="t('default_rating_4')"
                clearable
                style="max-width: 280px"
            />
        </div>

        <v-btn
            icon="fa-solid fa-trash"
            variant="plain"
            size="default"
            :aria-label="$t('Delete')"
            @click="emit('delete', section._key)"
        >
            <v-icon size="small" icon="fa-solid fa-trash" />
            <v-tooltip activator="parent" location="top">{{ $t('remove_section') }}</v-tooltip>
        </v-btn>
    </v-card>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n"
import {MODEL_FOR_MODE, type LocalSection} from "@/composables/useStartPageSections"
import ModelSelect from "@/components/inputs/ModelSelect.vue"

const {t} = useI18n()

defineProps<{
    section: LocalSection
    label: string
    description: string
    availableUsers: {value: number, label: string}[]
    ratingOptions: {value: number, label: string}[]
}>()

const emit = defineEmits<{
    (e: 'delete', key: string): void
}>()
</script>

<style scoped>
.drag-handle {
    cursor: grab;
}
</style>
