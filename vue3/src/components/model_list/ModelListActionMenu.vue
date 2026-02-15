<template>
    <v-btn class="float-right" icon="$menu" variant="plain">
        <v-icon icon="$menu" />
        <v-menu activator="parent" close-on-content-click>
            <v-list density="compact">
                <template v-for="([group, defs], groupIdx) in groupedActionDefs" :key="group">
                    <v-divider v-if="groupIdx > 0" />
                    <template v-for="action in defs" :key="action.key">
                        <v-list-item
                            v-if="action.isToggle"
                            @click.stop="$emit('action', action.key, item)"
                        >
                            <template #prepend>
                                <v-icon
                                    :icon="action.icon"
                                    :color="getToggleState(action, item) ? action.activeColor : action.inactiveColor"
                                />
                            </template>
                            {{ $t(action.labelKey) }}
                        </v-list-item>
                        <v-list-item
                            v-else
                            :prepend-icon="action.icon"
                            @click="$emit('action', action.key, item)"
                        >
                            {{ $t(action.labelKey) }}
                        </v-list-item>
                    </template>
                </template>
            </v-list>
        </v-menu>
    </v-btn>
</template>

<script setup lang="ts">
import type {ModelActionDef} from '@/composables/modellist/types'

defineProps<{
    item: any,
    actionDefs: ModelActionDef[],
    groupedActionDefs: Map<string, ModelActionDef[]>,
    getToggleState: (action: ModelActionDef, item: any) => boolean,
}>()

defineEmits<{
    action: [key: string, item: any]
}>()
</script>
