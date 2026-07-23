<template>
    <div class="d-flex align-center justify-end">
        <template v-for="action in quickActions" :key="action.key">
            <v-btn
                icon
                variant="plain"
                size="small"
                :aria-label="$t(action.labelKey)"
                @click.stop="$emit('action', action.key, item)"
            >
                <v-icon
                    :key="action.key + '-' + resolveColor(action, item)"
                    :icon="action.icon"
                    size="small"
                    :color="resolveColor(action, item)"
                />
                <v-tooltip v-if="!mobile" activator="parent" :text="$t(action.labelKey)" location="top" :open-delay="400" />
            </v-btn>
        </template>

        <v-btn icon="$menu" variant="plain" :aria-label="$t('Actions')">
            <v-icon icon="$menu" />
            <v-menu v-model="menuOpen" activator="parent" :close-on-content-click="false">
                <v-list density="compact">
                    <template v-for="([group, defs], groupIdx) in groupedActionDefs" :key="group">
                        <v-divider v-if="groupIdx > 0" />
                        <v-list-subheader v-if="group">{{ $t(group) }}</v-list-subheader>
                        <template v-for="action in defs" :key="action.key">
                            <v-list-item
                                v-if="action.isToggle && isVisible(action)"
                                @click.stop="menuOpen = false; $emit('action', action.key, item)"
                            >
                                <template #prepend>
                                    <v-icon
                                        :key="action.key + '-' + resolveColor(action, item)"
                                        :icon="action.icon"
                                        :color="resolveColor(action, item)"
                                    />
                                </template>
                                {{ $t(action.labelKey) }}
                            </v-list-item>
                            <v-list-item
                                v-else-if="!action.isToggle && isVisible(action)"
                                :class="action.isDanger ? 'text-error' : undefined"
                                @click="menuOpen = false; $emit('action', action.key, item)"
                            >
                                <template #prepend>
                                    <v-icon
                                        :icon="action.icon"
                                        :color="resolveColor(action, item)"
                                    />
                                </template>
                                {{ $t(action.labelKey) }}
                            </v-list-item>
                        </template>
                    </template>
                </v-list>
            </v-menu>
        </v-btn>
    </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {useDisplay} from 'vuetify'
import type {ActionDef, ModelItem} from '@/composables/modellist/types'

const {mobile} = useDisplay()

const props = withDefaults(defineProps<{
    item: ModelItem,
    actionDefs: ActionDef[],
    groupedActionDefs: Map<string, ActionDef[]>,
    getToggleState: (action: ActionDef, item: ModelItem) => boolean,
    quickActionKeys?: string[],
}>(), {
    quickActionKeys: () => [],
})

defineEmits<{
    action: [key: string, item: ModelItem]
}>()

const menuOpen = ref(false)

const quickActions = computed(() =>
    (props.quickActionKeys ?? [])
        .map(key => props.actionDefs.find(a => a.key === key))
        .filter((a): a is ActionDef => !!a && isVisible(a))
)

function isVisible(action: ActionDef): boolean {
    return !action.visible || action.visible(props.item)
}

function resolveColor(action: ActionDef, item: ModelItem): string | undefined {
    if (action.colorResolver) return action.colorResolver(item)
    if (!action.isToggle) return undefined
    return props.getToggleState(action, item) ? action.activeColor : action.inactiveColor
}
</script>
