<template>
    <v-tabs v-model="currentTab" grow>
        <v-tab value="shopping"><i class="fas fa-shopping-cart fa-fw"></i> <span class="d-none d-md-block ms-1">Shopping List</span></v-tab>
        <v-tab value="recipes"><i class="fas fa-book fa-fw"></i> <span class="d-none d-md-block ms-1">Recipes</span></v-tab>
    </v-tabs>

    <v-window v-model="currentTab">
        <v-window-item value="shopping">
            <v-container>


                <v-row>
                    <v-col>
                        <v-list lines="two" density="compact">

                            <template v-for="category in useShoppingStore().getEntriesByGroup">
                                <v-list-subheader>{{ category.name }}</v-list-subheader>
                                {{category.stats}}
                                <v-divider></v-divider>

                                <template v-for="item in category.foods">
                                    <v-list-item>
                                        {{ item[1].food.name }}

                                        <template v-slot:append>
                                            <v-btn
                                                color="success"
                                                icon="fas fa-check"
                                                variant="text"
                                            ></v-btn>
                                        </template>
                                    </v-list-item>
                                </template>
                            </template>
                        </v-list>
                    </v-col>
                </v-row>
            </v-container>
        </v-window-item>
        <v-window-item value="recipes">
            Recipes
        </v-window-item>
    </v-window>

</template>

<script setup lang="ts">

import {ref} from "vue";
import {useShoppingStore} from "@/stores/ShoppingStore";

const currentTab = ref("shopping")

useShoppingStore().refreshFromAPI()

</script>

<style scoped>

</style>