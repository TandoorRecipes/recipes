<template>
    <v-form>
        <p class="text-h6">{{ $t('Home') }}</p>
        <v-divider class="mb-3" />

        <!-- Default page -->
        <v-select
            :label="$t('DefaultPage')"
            :hint="$t('DefaultPageHelp')"
            persistent-hint
            v-model="defaultPage"
            :items="defaultPageOptions"
            item-title="label"
            item-value="page"
            density="compact"
            class="mb-4"
        />

        <!-- Meal Plan toggle -->
        <v-label class="text-overline text-medium-emphasis d-block mb-1">{{ $t('Meal_Plan') }}</v-label>
        <v-card variant="outlined" class="d-flex align-center ga-2 pa-3 mb-2">
            <v-icon icon="fa-solid fa-calendar-days" size="small" />
            <span class="text-body-2 font-weight-medium flex-grow-1">{{ $t('show_meal_plan_on_home') }}</span>
            <v-switch
                v-model="showMealPlan"
                density="compact"
                hide-details
                color="primary"
                class="flex-grow-0"
            />
        </v-card>

        <!-- Recipe Sections -->
        <v-label class="text-overline text-medium-emphasis d-block mb-1 mt-4">{{ $t('Sections') }}</v-label>
        <p class="text-body-2 text-medium-emphasis mb-2">{{ $t('home_sections_help') }}</p>

        <VueDraggable
            v-model="localSections"
            handle=".drag-handle"
        >
            <SectionRow
                v-for="section in localSections"
                :key="section._key"
                :section="section"
                :label="modeLabel(section.mode)"
                :description="modeDescription(section.mode)"
                :available-users="availableUsers"
                :rating-options="ratingOptions"
                @delete="removeSection"
            />
        </VueDraggable>

        <!-- Add section -->
        <div class="d-flex align-center mt-3 ga-2">
            <v-select
                v-model="newMode"
                :items="availableModes"
                item-title="label"
                item-value="value"
                density="compact"
                hide-details
                variant="outlined"
                :placeholder="$t('add_section')"
                class="flex-grow-1"
            />
            <v-btn
                icon="fa-solid fa-plus"
                color="primary"
                size="default"
                :disabled="!newMode"
                :aria-label="$t('add_section')"
                @click="addSection"
            >
                <v-icon icon="fa-solid fa-plus" />
            </v-btn>
        </div>

        <!-- Actions -->
        <div class="d-flex align-center mt-4 ga-2">
            <v-btn
                color="success"
                prepend-icon="$save"
                @click="save"
            >
                {{ $t('Save') }}
            </v-btn>
            <v-spacer />
            <v-btn
                variant="text"
                color="warning"
                prepend-icon="fa-solid fa-rotate-left"
                @click="confirmReset = true"
            >
                {{ $t('Reset') }}
            </v-btn>
        </div>

        <!-- Reset confirmation dialog -->
        <v-dialog v-model="confirmReset" max-width="400">
            <v-card>
                <v-card-title>{{ $t('Reset') }}</v-card-title>
                <v-card-text>{{ $t('confirm_reset_sections') }}</v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="confirmReset = false">{{ $t('Cancel') }}</v-btn>
                    <v-btn color="warning" @click="confirmReset = false; resetToDefaults()">{{ $t('Reset') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete confirmation dialog -->
        <v-dialog v-model="confirmDelete" max-width="400">
            <v-card>
                <v-card-title>{{ $t('Delete') }}</v-card-title>
                <v-card-text>{{ $t('confirm_delete_section', {name: deleteSectionName}) }}</v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="cancelDelete">{{ $t('Cancel') }}</v-btn>
                    <v-btn color="error" @click="confirmDelete = false; doRemoveSection()">{{ $t('Delete') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-form>
</template>

<script setup lang="ts">
import {ref, onMounted} from "vue"
import {VueDraggable} from "vue-draggable-plus"
import {ApiApi} from "@/openapi"
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore"
import {useStartPageSections} from "@/composables/useStartPageSections"
import SectionRow from "@/components/settings/SectionRow.vue"

const userPrefs = useUserPreferenceStore()

const {
    defaultPage,
    showMealPlan,
    localSections,
    newMode,
    confirmReset,
    confirmDelete,
    deleteSectionName,
    availableModes,
    defaultPageOptions,
    modeLabel,
    modeDescription,
    addSection,
    removeSection,
    doRemoveSection,
    cancelDelete,
    resetToDefaults,
    save,
    loadFromStore,
} = useStartPageSections()

const ratingOptions = [
    {value: 1, label: '≥ 1'},
    {value: 2, label: '≥ 2'},
    {value: 3, label: '≥ 3'},
    {value: 4, label: '≥ 4'},
    {value: 5, label: '5'},
]

const availableUsers = ref<{value: number, label: string}[]>([])

onMounted(async () => {
    if (!userPrefs.initCompleted) {
        await userPrefs.init()
    }

    new ApiApi().apiUserList({}).then(users => {
        availableUsers.value = users.map(u => ({value: u.id!, label: u.displayName ?? `User #${u.id}`}))
    }).catch(() => {})

    loadFromStore()
})
</script>

<style scoped>
.drag-handle {
    cursor: grab;
}
</style>
