<template>
    <div class="d-flex align-center justify-end">
        <template v-for="action in quickActions" :key="action.key">
            <v-tooltip :text="$t(action.labelKey)" location="top" :open-delay="1200">
                <template #activator="{ props: tooltipProps }">
                    <v-btn
                        v-bind="tooltipProps"
                        icon
                        variant="plain"
                        size="small"
                        @click.stop="$emit('action', action.key, item)"
                    >
                        <v-icon
                            :icon="action.icon"
                            size="small"
                            :color="resolveColor(action, item)"
                        />
                    </v-btn>
                </template>
            </v-tooltip>
        </template>

        <v-btn icon="$menu" variant="plain">
            <v-icon icon="$menu" />
            <v-menu activator="parent" close-on-content-click>
                <v-list density="compact">
                    <template v-for="([group, defs], groupIdx) in groupedActionDefs" :key="group">
                        <v-divider v-if="groupIdx > 0" />
                        <v-list-subheader v-if="group">{{ $t(group) }}</v-list-subheader>
                        <template v-for="action in defs" :key="action.key">
                            <v-list-item
                                v-if="action.isToggle"
                                @click.stop="$emit('action', action.key, item)"
                            >
                                <template #prepend>
                                    <v-icon
                                        :icon="action.icon"
                                        :color="resolveColor(action, item)"
                                    />
                                </template>
                                {{ $t(action.labelKey) }}
                            </v-list-item>
                            <v-list-item
                                v-else
                                :prepend-icon="action.icon"
                                :class="action.isDanger ? 'text-error' : undefined"
                                @click="$emit('action', action.key, item)"
                            >
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
import {computed} from 'vue'
import type {ModelActionDef} from '@/composables/modellist/types'

const props = defineProps<{
    item: any,
    actionDefs: ModelActionDef[],
    groupedActionDefs: Map<string, ModelActionDef[]>,
    getToggleState: (action: ModelActionDef, item: any) => boolean,
    quickActionKeys?: string[],
}>()

defineEmits<{
    action: [key: string, item: any]
}>()

const quickActions = computed(() =>
    (props.quickActionKeys ?? [])
        .map(key => props.actionDefs.find(a => a.key === key))
        .filter((a): a is ModelActionDef => !!a)
)

function resolveColor(action: ModelActionDef, item: any): string | undefined {
    if (!action.isToggle) return undefined
    if (action.colorResolver) return action.colorResolver(item)
    return props.getToggleState(action, item) ? action.activeColor : action.inactiveColor
}
</script>
