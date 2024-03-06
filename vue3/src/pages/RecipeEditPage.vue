<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>{{ recipe.name }}</v-card-title>

                    <v-card-text>


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


                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>


        <v-row v-for="(step, index) in recipe.steps" class="mt-1">
            <v-col>
                <step-editor v-model="recipe.steps[index]" :step-index="index"></step-editor>
            </v-col>
        </v-row>
    </v-container>

    <v-btn @click="updateRecipe()">Save</v-btn>
    <v-btn :to="{name: 'view_recipe', params: {id: recipe_id}}">View</v-btn>


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
        api.apiKeywordList({page: 1, pageSize: 100}).then(r => {
            this.keywords = r.results
        })
    },
    methods: {
        refreshRecipe() {
            if (this.recipe.id != Number(this.recipe_id)) {
                const api = new ApiApi()
                api.apiRecipeRetrieve({id: Number(this.recipe_id)}).then(r => {
                    this.recipe = r
                })
            }
        },
        updateRecipe() {
            const api = new ApiApi()
            api.apiRecipeUpdate({id: Number(this.recipe_id), recipe: this.recipe}).then(r => {
                this.recipe = r
            })
        }
    }
})
</script>


<style scoped>

</style>