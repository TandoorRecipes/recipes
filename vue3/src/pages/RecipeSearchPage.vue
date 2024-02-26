<template>




    <!--TODO ideas for "start page": new recipes, meal plan, "last year/month/cooked long ago", high rated, random keyword -->

    <!--    <v-row>-->
    <!--        <v-col cols="12" sm="3" md="4" v-for="r in recipes" :key="r.id">-->
    <!--            <RecipeCardComponent :recipe="r"></RecipeCardComponent>-->
    <!--        </v-col>-->
    <!--    </v-row>-->

</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {ApiApi, Recipe} from "@/openapi";
import KeywordsComponent from "@/components/display/KeywordsBar.vue";
import RecipeCardComponent from "@/components/display/RecipeCard.vue";
import GlobalSearchDialog from "@/components/inputs/GlobalSearchDialog.vue";


export default defineComponent({
    name: "RecipeSearchPage",
    components: {GlobalSearchDialog, RecipeCardComponent, KeywordsComponent},
    computed: {

    },
    data() {
        return {
            recipes: [] as Recipe[],


        }
    },
    mounted() {



    },
    methods: {

    }
})
</script>

<style scoped>

</style>