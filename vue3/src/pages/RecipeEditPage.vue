<template>
    <v-container>

        <v-form>
            <v-text-field
                label="Name"
                v-model="recipe.name"
            ></v-text-field>

            <v-textarea
                label="Description"
                v-model="recipe.description"
                clearable
            ></v-textarea>

            <v-combobox
                label="Keywords"
                v-model="recipe.keywords"
                :items="keywords"
                item-title="name"
                multiple
                clearable
                chips
            ></v-combobox>

            <v-row>
                <v-col>
                    <v-text-field
                        v-model.number="recipe.waitingTime"
                        label="Waiting Time (min)"
                    ></v-text-field>
                </v-col>
                <v-col>
                    <v-text-field
                        v-model.number="recipe.workingTime"
                        label="Working Time (min)"
                    ></v-text-field>
                </v-col>
            </v-row>

            <v-row>
                <v-col>
                    <v-text-field
                        v-model.number="recipe.servings"
                        label="Servings"
                    ></v-text-field>
                </v-col>
                <v-col>
                    <v-text-field
                        v-model="recipe.servingsText"
                        label="Servings Text"
                    ></v-text-field>
                </v-col>
            </v-row>

            <v-row v-for="(step, index) in recipe.steps">
                <v-col>
                    <step-editor :step="step" :step-index="index"></step-editor>
                </v-col>
            </v-row>

        </v-form>

        <v-btn @click="updateRecipe()">Save</v-btn>
        <v-btn :to="{name: 'view_recipe', params: {id: recipe_id}}">View</v-btn>
    </v-container>


</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {ApiApi, Keyword, Recipe} from "@/openapi";
import StepMarkdownEditor from "@/components/inputs/StepMarkdownEditor.vue";
import StepEditor from "@/components/inputs/StepEditor.vue";


export default defineComponent({
    name: "RecipeEditPage",
    components: {StepEditor, StepMarkdownEditor},
    props: {
        recipe_id: {type: String, required: false},
    },
    watch: {
        recipe_id: function () {
            this.refreshRecipe()
        }
    },
    data() {
        return {
            recipe: {} as Recipe,
            keywords: [] as Keyword[],
        }
    },
    mounted() {
        this.refreshRecipe()

        const api = new ApiApi()
        api.apiKeywordList().then(r => {
            this.keywords = r.results
        })
    },
    methods: {
        refreshRecipe() {
            if (this.recipe.id != this.recipe_id) {
                const api = new ApiApi()
                api.apiRecipeRetrieve({id: Number(this.recipe_id)}).then(r => {
                    this.recipe = r
                })
            }
        },
        updateRecipe() {
            const api = new ApiApi()
            api.apiRecipeUpdate({id: this.recipe_id, recipe: this.recipe}).then(r => {
                this.recipe = r
            })
        }
    }
})
</script>


<style scoped>

</style>