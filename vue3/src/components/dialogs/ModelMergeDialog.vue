<template>
    <v-dialog max-width="600px" :activator="props.activator" v-model="dialog">
        <v-card>
            <v-card-title>{{ $t('merge_title', {type: getGenericModelFromString(props.model).model.name}) }}</v-card-title>
            <!-- TODO localize model name -->
            <v-card-text>
                {{ $t('merge_selection', {source: '', type: getGenericModelFromString(props.model).model.name}) }}
                <model-select append-to-body :model="props.model"></model-select>
            </v-card-text>
            <v-card-actions>
                <v-btn>{{ $t('Cancel') }}</v-btn>
                <v-btn color="warning">{{ $t('Merge') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {PropType} from "vue";
import {EditorSupportedModels, getGenericModelFromString} from "@/types/Models";

const props = defineProps({
    model: {type: String as PropType<EditorSupportedModels>, required: true},
    sourceObject: {},
    activator: {type: String, default: 'parent'},
})

const dialog = defineModel<boolean>({default: false})

function mergeModel() {
    
}

</script>


<style scoped>

</style>