<template>

    <v-tabs>
        <v-tab :value="1"><i class="fas fa-shopping-cart fa-fw"></i></v-tab>
        <v-tab :value="2">Super</v-tab>
        <v-tab :value="3">Super</v-tab>
    </v-tabs>

</template>

<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
    name: "ShoppingListPage",
    data(){
        return {
            tab: 1,

            //user_id: parseInt(localStorage.getItem('USER_ID')),
            editing_supermarket_categories: [],
            editing_supermarket: null,
            new_supermarket: {entrymode: false, value: undefined, editmode: undefined},
            new_category: {entrymode: false, value: undefined},
            autosync_id: undefined,
            new_item: {amount: 1, unit: undefined, food: undefined, ingredient: undefined},
            new_recipe: {
                id: undefined,
            },

            // shopping_list_store: useShoppingListStore(),
            // user_preference_store: useUserPreferenceStore(),
        }
    }
})
</script>

<style scoped>

</style>