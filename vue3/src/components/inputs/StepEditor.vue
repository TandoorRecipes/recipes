<template>

    <!--TODO  name, time, recipe, file(s), ingredients, quick add ingredients -->
    <v-card>
        <template #title>
            <v-card-title v-if="step.name">{{ step.name }}</v-card-title>
            <v-card-title v-else-if="stepIndex !== undefined">Step {{ stepIndex + 1 }}</v-card-title>
        </template>
        <template v-slot:append>
            <v-btn size="small" variant="plain" icon="fas fa-sliders-h"></v-btn> <!--TODO implement -->
        </template>

        <v-card-text>
            <v-text-field
                v-model="step.name"
                label="Step Name"
            ></v-text-field>
            <v-chip-group>
                <v-chip><i class="fas fa-plus-circle"></i> Time</v-chip>
            </v-chip-group>

            <ingredients-table :ingredients="step.ingredients" :show-notes="false" draggable>

            </ingredients-table>

            <v-alert @click="dialog_markdown_edit = true">
                {{ step.instruction }}
            </v-alert>

        </v-card-text>
    </v-card>


    <v-dialog
        v-model="dialog_markdown_edit"
        transition="dialog-bottom-transition"
        fullscreen
        @close="$emit('change', {step: step})">
        <v-card>
            <v-toolbar>
                <v-toolbar-title>Edit Instructions</v-toolbar-title>
                <v-btn icon="fas fa-close" @click="dialog_markdown_edit = false"></v-btn>
            </v-toolbar>
            <step-markdown-editor class="h-100" :step="step" @change="step = $event.step; $emit('change', {step: step})"></step-markdown-editor>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {Step} from "@/openapi";
import StepMarkdownEditor from "@/components/inputs/StepMarkdownEditor.vue";
import IngredientsTable from "@/components/display/IngredientsTable.vue";

export default defineComponent({
    name: "StepEditor",
    components: {IngredientsTable, StepMarkdownEditor},
    emits: {
        change(payload: { step: Step }) {
            return payload
        }
    },
    props: {
        step: {
            type: Object as PropType<Step>,
            required: true,
        },
        stepIndex: {
            type: Number,
            required: false,
        },
    },
    data() {
        return {
            dialog_markdown_edit: false,
        }
    }
})
</script>


<style scoped>

</style>