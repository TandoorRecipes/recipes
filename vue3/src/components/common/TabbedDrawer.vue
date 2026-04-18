<template>
    <v-navigation-drawer
        v-if="!mobile"
        v-model="isOpen"
        location="right"
        :width="width"
        :permanent="isPinned && isOpen"
        :temporary="!isPinned"
        disable-resize-watcher
    >
        <v-toolbar density="compact" flat>
            <v-spacer />
            <v-btn
                v-if="pinnable"
                icon
                variant="plain"
                size="small"
                :aria-label="isPinned ? $t('Unpin') : $t('Pin')"
                @click="isPinned = !isPinned"
            >
                <v-icon :class="{'fa-rotate-90': !isPinned}">fa-solid fa-thumbtack</v-icon>
                <v-tooltip activator="parent" :text="isPinned ? $t('UnpinPanel') : $t('PinPanel')" location="bottom" :open-delay="400" />
            </v-btn>
            <v-btn
                icon="fa-solid fa-times"
                variant="plain"
                size="small"
                :aria-label="$t('Close')"
                @click="closeAndUnpin"
            />
        </v-toolbar>

        <template v-if="tabs.length > 1">
            <v-tabs v-model="currentTab" density="compact" grow>
                <v-tab v-for="tab in tabs" :key="tab.key" :value="tab.key">
                    <v-icon start size="small">{{ tab.icon }}</v-icon>
                    {{ tab.label }}
                </v-tab>
            </v-tabs>

            <v-divider />
        </template>

        <v-tabs-window v-model="currentTab">
            <v-tabs-window-item v-for="tab in tabs" :key="tab.key" :value="tab.key">
                <slot :name="tab.key" />
            </v-tabs-window-item>
        </v-tabs-window>
    </v-navigation-drawer>

    <v-bottom-sheet v-else v-model="isOpen" scrollable>
        <v-card :style="sheetDragStyle">
            <div
                role="presentation"
                style="display: flex; justify-content: center; padding: 12px 0 4px; cursor: grab; touch-action: none;"
                @touchstart.passive="onSheetDragStart"
                @touchmove="onSheetDragMove"
                @touchend.passive="onSheetDragEnd"
            >
                <div style="width: 40px; height: 4px; border-radius: 2px; background: rgba(var(--v-theme-on-surface), 0.3);" />
            </div>

            <v-card-title class="d-flex align-center pa-0">
                <v-tabs v-if="tabs.length > 1" v-model="currentTab" density="compact" grow>
                    <v-tab v-for="tab in tabs" :key="tab.key" :value="tab.key">
                        <v-icon start size="small">{{ tab.icon }}</v-icon>
                        {{ tab.label }}
                    </v-tab>
                </v-tabs>
                <span v-else class="text-subtitle-2 px-4 flex-grow-1">{{ tabs[0]?.label }}</span>
                <v-btn icon="fa-solid fa-times" variant="plain" size="small" :aria-label="$t('Close')" @click="closeAndUnpin" />
            </v-card-title>

            <v-divider />

            <v-card-text style="max-height: 60vh; overflow-y: auto;" class="pa-0">
                <v-tabs-window v-model="currentTab">
                    <v-tabs-window-item v-for="tab in tabs" :key="tab.key" :value="tab.key">
                        <slot :name="tab.key" />
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-card-text>

            <v-divider />

            <v-card-actions>
                <slot name="footer" :active-tab="currentTab" />
            </v-card-actions>
        </v-card>
    </v-bottom-sheet>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {useDisplay} from 'vuetify'

const props = withDefaults(defineProps<{
    modelValue: boolean
    activeTab?: string
    pinned?: boolean
    pinnable?: boolean
    tabs: { key: string, label: string, icon: string }[]
    width?: number
    useSheet?: boolean
}>(), {
    activeTab: undefined,
    pinned: false,
    pinnable: true,
    width: 320,
    useSheet: false,
})

const emit = defineEmits<{
    'update:modelValue': [val: boolean]
    'update:activeTab': [val: string]
    'update:pinned': [val: boolean]
}>()

const {mobile: vuetifyMobile} = useDisplay()
const mobile = computed(() => vuetifyMobile.value || props.useSheet)

const isOpen = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
})

const currentTab = computed({
    get: () => props.activeTab ?? props.tabs[0]?.key ?? '',
    set: (val: string) => emit('update:activeTab', val),
})

const isPinned = computed({
    get: () => props.pinned,
    set: (val: boolean) => emit('update:pinned', val),
})

// Closing the drawer also drops the pinned state. The pin preference is
// persisted to localStorage, but the drawer itself starts closed on every
// route change — if close left pinned=true, the user would land on a page
// with a pinned drawer that's closed and no way to reach the unpin toggle,
// effectively stranding them. Treating close as "dismiss and unpin" keeps
// the pin meaningful: it expires the next time the user actively dismisses.
function closeAndUnpin() {
    isOpen.value = false
    if (isPinned.value) isPinned.value = false
}

// Bottom sheet drag-to-dismiss
const dragStartY = ref(0)
const dragOffset = ref(0)
const isDragging = ref(false)

const sheetDragStyle = computed(() => {
    if (dragOffset.value <= 0) return undefined
    return {
        transform: `translateY(${dragOffset.value}px)`,
        transition: isDragging.value ? 'none' : 'transform 0.2s ease',
    }
})

function onSheetDragStart(e: TouchEvent) {
    dragStartY.value = e.touches[0]!.clientY
    dragOffset.value = 0
    isDragging.value = true
}

function onSheetDragMove(e: TouchEvent) {
    if (!isDragging.value) return
    const dy = e.touches[0]!.clientY - dragStartY.value
    dragOffset.value = Math.max(0, dy)
}

function onSheetDragEnd() {
    if (dragOffset.value > 100) {
        isOpen.value = false
    }
    dragOffset.value = 0
    isDragging.value = false
}
</script>
