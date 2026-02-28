<template>
    <v-btn
        v-if="!disableCreate"
        icon
        :size="compact ? 'small' : undefined"
        :class="{'float-right': !compact}"
        color="create"
    >
        <v-icon icon="fa-solid fa-plus" />
        <model-edit-dialog
            :close-after-create="false"
            :model="model"
            @create="emit('change')"
            @save="emit('change')"
            @delete="emit('change')"
        />
    </v-btn>
</template>

<script setup lang="ts">
import type {EditorSupportedModels} from '@/types/Models'
import ModelEditDialog from '@/components/dialogs/ModelEditDialog.vue'

withDefaults(defineProps<{
    model: EditorSupportedModels
    disableCreate?: boolean
    compact?: boolean
}>(), {
    disableCreate: false,
    compact: false,
})

const emit = defineEmits<{ change: [] }>()
</script>
