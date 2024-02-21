<template>
    <v-card to="/search">
        <v-card-title><i class="fas fa-chevron-left mr-3"></i>{{ recipe.name }}</v-card-title>
    </v-card>

    <v-img cover lazy :src="recipe.image"></v-img>


    <v-card>

        <v-container>
            <v-row class="text-center text-body-2">
                <v-col class="pt-1 pb-1">
                    <i class="fas fa-cogs"></i> {{ recipe.workingTime }} min<br/>
                    <v-label>Working Time</v-label>
                </v-col>
                <v-col class="pt-1 pb-1">
                    <div><i class="fas fa-hourglass-half"></i> {{ recipe.waitingTime }} min</div>
                    <div class="text-grey">Waiting Time</div>
                </v-col>
                <v-col class="pt-1 pb-1">
                    <i class="fas fa-calendar-alt"></i> {{ recipe.servings }} <br/>
                    <div class="text-grey"><span v-if="recipe?.servingsText">{{ recipe.servingsText }}</span><span v-else>Servings</span></div>
                </v-col>

            </v-row>
        </v-container>

        <v-card-subtitle v-if="recipe?.description"> {{ recipe.description }}</v-card-subtitle>
        <v-card-subtitle>
            <KeywordsComponent :keywords="recipe?.keywords"></KeywordsComponent>
        </v-card-subtitle>


        <v-card-text>

            <v-chip size="small" color="primary" label>
                <v-icon icon="fa fa-clock" class="mr-2"></v-icon>
                {{ recipe.workingTime }} min
            </v-chip>
            <v-chip size="small" color="primary" label>
                <v-icon icon="fas fa-hourglass-half" class="mr-2"></v-icon>
                {{ recipe.waitingTime }} min
            </v-chip>

        </v-card-text>
    </v-card>

    <v-btn color="primary" id="id_btn_test">test</v-btn>

    <v-dialog
    activator="parent">


        <template #default>
            <v-card title="Servings">
                <v-card-text>
                    <v-btn>{{recipe.servings / 2}}</v-btn>
                    <v-text-field v-model="recipe.servings">
                        <template #append><v-btn @click="recipe.servings++">+</v-btn></template>
                        <template #prepend><v-btn @click="recipe.servings--">-</v-btn></template>
                    </v-text-field>
                    <v-btn>{{recipe.servings * 2}}</v-btn>
                </v-card-text>


            </v-card>
        </template>
    </v-dialog>

</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {Recipe} from "@/openapi";
import KeywordsComponent from "@/components/display/KeywordsComponent.vue";

export default defineComponent({
    name: "RecipeViewComponent",
    components: {KeywordsComponent},
    props: {
        recipe: {} as PropType<Recipe>
    }
})
</script>

<style scoped>

</style>