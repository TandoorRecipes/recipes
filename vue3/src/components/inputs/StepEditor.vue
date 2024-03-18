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
                <v-chip v-if="step.time == 0"><i class="fas fa-plus-circle fa-fw mr-1"></i> Time</v-chip>
                <v-chip v-if="step.instruction == ''"><i class="fas fa-plus-circle fa-fw mr-1"></i> Instructions</v-chip>
                <v-chip v-if="step.file == null"><i class="fas fa-plus-circle fa-fw mr-1"></i> File</v-chip>
                <v-chip v-if="step.stepRecipe == null"><i class="fas fa-plus-circle fa-fw mr-1"></i> Recipe</v-chip>
            </v-chip-group>

            <v-table density="compact">

                <draggable tag="tbody" v-model="step.ingredients" handle=".drag-handle" item-key="id" @sort="sortIngredients">
                    <template #item="{element}">
                        <v-dialog>
                            <template v-slot:activator="{ props: activatorProps }">
                                <IngredientsTableRow v-bind="activatorProps" :ingredient="element" :key="element.id" :show-notes="false" :draggable="true"></IngredientsTableRow>
                            </template>
                            <template v-slot:default="{ isActive }">
                                <v-card  >
                                    <v-card-title>Ingredient</v-card-title>
                                   <v-card-text>
                                       <v-form>
                                           <v-text-field
                                               label="Amount"
                                                v-model.number="element.amount"
                                           ></v-text-field>
                                           <model-select model="Unit" v-model="element.unit" :multiple="false"></model-select>
                                           <model-select model="Food" v-model="element.food" :multiple="false"></model-select>
                                           <v-text-field
                                               label="Note"
                                                v-model="element.note"
                                           ></v-text-field>
                                       </v-form>

                                   </v-card-text>
                                </v-card>
                            </template>
                        </v-dialog>

                    </template>
                </draggable>

            </v-table>

            <v-alert @click="dialog_markdown_edit = true" class="mt-2">
                {{ step.instruction }}
            </v-alert>

        </v-card-text>
    </v-card>

    <v-dialog
        v-model="dialog_markdown_edit"
        transition="dialog-bottom-transition">
        <v-card>
            <v-card-title>Ingredient</v-card-title>
            <v-form>
                <v-text-field></v-text-field>
            </v-form>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="dialog_markdown_edit"
        transition="dialog-bottom-transition"
        fullscreen>
        <v-card>
            <v-toolbar>
                <v-toolbar-title>Edit Instructions</v-toolbar-title>
                <v-btn icon="fas fa-close" @click="dialog_markdown_edit = false"></v-btn>
            </v-toolbar>
            <step-markdown-editor class="h-100" :step="step" @change="step = $event.step;"></step-markdown-editor>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {Step} from "@/openapi";
import StepMarkdownEditor from "@/components/inputs/StepMarkdownEditor.vue";
import IngredientsTable from "@/components/display/IngredientsTable.vue";
import IngredientsTableRow from "@/components/display/IngredientsTableRow.vue";
import draggable from "vuedraggable";
import ModelSelect from "@/components/inputs/ModelSelect.vue";

export default defineComponent({
    name: "StepEditor",
    components: {ModelSelect, draggable, IngredientsTableRow, IngredientsTable, StepMarkdownEditor},
    emits: ['update:modelValue'],
    props: {
        modelValue: {
            type: Object as PropType<Step>,
            required: true,
        },
        stepIndex: {
            type: Number,
            required: false,
        },
    },
    computed: {
        step: {
            get() {
                return this.modelValue
            },
            set(value: Step) {
                this.$emit('update:modelValue', value)
            }
        }
    },
    data() {
        return {
            dialog_markdown_edit: false,
        }
    },
    methods: {
        sortIngredients() {
            this.step.ingredients.forEach((value, index) => {
                value.order = index
            })
        }
    }
})
</script>


<style scoped>

</style>