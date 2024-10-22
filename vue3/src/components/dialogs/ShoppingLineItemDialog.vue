<template>
    <v-dialog v-model="showDialog" max-width="500px">
        <v-card>
            <v-closable-card-title :title="props.shoppingListFood.food.name" v-model="showDialog"></v-closable-card-title>

            <v-card-text>

                <v-label>{{ $t('Choose_Category') }}</v-label>
                <ModelSelect model="SupermarketCategory"></ModelSelect>

                <v-row>
                    <v-col>
                        <v-btn height="80px" color="info" block stacked>
                            <i class="fa-solid fa-clock-rotate-left fa-2x mb-2"></i>
                            {{ $t('Postpone') }}
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn height="80px" color="secondary" block stacked>
                            <i class="fa-solid fa-eye-slash fa-2x mb-2"></i>
                            {{ $t('Ignore_Shopping') }}
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-btn height="80px" color="primary" block stacked>
                            <i class="fa-solid fa-pencil fa-2x mb-2"></i>
                            {{ $t('Edit_Food') }}
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn height="80px" color="success" block stacked>
                            <i class="fa-solid fa-plus fa-2x mb-2"></i>
                            {{ $t('Add') }}
                        </v-btn>
                    </v-col>
                </v-row>

                <v-label class="mt-2">{{ $t('Entries') }}</v-label>
                <v-list density="compact">
                    <v-list-item variant="tonal" class="mt-1" v-for="[i, e] in props.shoppingListFood.entries" :key="e.id">
                        <v-list-item-title>
                            <b>
                                {{ e.amount }}
                                <span v-if="e.unit">{{ e.unit.name }}</span>
                            </b>
                            {{ e.food.name }}
                        </v-list-item-title>
                        <v-list-item-subtitle v-if="e.recipeMealplan && e.recipeMealplan.recipeName !== ''">
                            <v-icon icon="$recipes" size="x-small"></v-icon> {{ e.recipeMealplan.servings }} {{ $t('Servings') }}
                            <router-link :to="{name: 'view_recipe', params: {id: e.recipeMealplan.id}}" target="_blank"><b>
                                {{ e.recipeMealplan.recipeName }} </b>
                            </router-link>
                        </v-list-item-subtitle>
                        <v-list-item-subtitle v-if="e.recipeMealplan && e.recipeMealplan.mealplanType !== undefined">
                            <v-icon icon="$mealplan" size="x-small"></v-icon> {{ e.recipeMealplan.mealplanType }} {{ DateTime.fromJSDate(e.recipeMealplan.mealplanFromDate).toLocaleString(DateTime.DATE_SHORT) }}
                        </v-list-item-subtitle>
                        <v-list-item-subtitle>
                            <v-icon icon="fa-solid fa-user" size="x-small"></v-icon> {{ e.createdBy.displayName }} - {{ DateTime.fromJSDate(e.createdAt).toLocaleString(DateTime.DATETIME_SHORT) }}
                        </v-list-item-subtitle>

                        <template #append>
                            <v-btn size="small" color="edit"> <v-icon icon="$edit"></v-icon></v-btn>
                            <v-btn size="small" color="delete"> <v-icon icon="$delete"></v-icon></v-btn>
                        </template>
                    </v-list-item>
                </v-list>

            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import {PropType} from "vue";
import {ShoppingListEntry} from "@/openapi";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {IShoppingList, IShoppingListFood} from "@/types/Shopping";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {DateTime} from "luxon";

const showDialog = defineModel<Boolean>()

const props = defineProps({
    shoppingListFood: {type: {} as PropType<IShoppingListFood>, required: true},
})

</script>

<style scoped>

</style>