<template>
    <v-card>
        <v-card-text class="d-flex align-center pt-2 pb-2" :class="mobile ? 'px-1' : undefined">
            <v-btn
                icon
                variant="text"
                size="small"
                :aria-label="$t('Close')"
                @click="emit('close')"
            >
                <v-icon>fa-solid fa-xmark</v-icon>
            </v-btn>

            <v-btn variant="text" class="text-none" :size="mobile ? 'small' : 'default'" append-icon="fa-solid fa-caret-down">
                {{ $t('Select') }}
                <v-menu activator="parent" close-on-content-click>
                    <v-list density="compact">
                        <v-list-item @click="emit('select-all')">
                            {{ $t('Select_Page') }}
                        </v-list-item>
                        <v-list-item @click="emit('select-none')">
                            {{ $t('None') }}
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-btn>

            <span :class="mobile ? 'text-caption ml-1' : 'text-body-2 ml-2'" aria-live="polite">
                {{ $t('Selected') }} {{ selectedCount }}
            </span>

            <v-spacer />

            <template v-if="!mobile">
                <slot name="actions" />
            </template>
            <template v-else>
                <v-btn variant="text" class="text-none" size="small" append-icon="fa-solid fa-caret-down">
                    {{ $t('Actions') }}
                    <v-menu activator="parent" close-on-content-click>
                        <v-list density="compact">
                            <slot name="actions-menu" />
                        </v-list>
                    </v-menu>
                </v-btn>
            </template>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import {useDisplay} from 'vuetify'

const {mobile} = useDisplay()

defineProps<{
    selectedCount: number
}>()

const emit = defineEmits<{
    close: []
    'select-all': []
    'select-none': []
}>()
</script>
