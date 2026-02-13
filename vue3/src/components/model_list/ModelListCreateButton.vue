<template>
    <v-btn
        v-if="!disableCreate"
        icon
        :size="compact ? 'small' : undefined"
        :class="{'float-right': !compact}"
        color="create"
    >
        <i class="fa-solid fa-plus"></i>
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
import {PropType} from 'vue'
import type {EditorSupportedModels} from '@/types/Models'
import ModelEditDialog from '@/components/dialogs/ModelEditDialog.vue'

defineProps({
    model: {type: String as PropType<EditorSupportedModels>, required: true},
    disableCreate: {type: Boolean, default: false},
    compact: {type: Boolean, default: false},
})

const emit = defineEmits(['change'])
</script>
