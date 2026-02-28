<template>
    <v-dialog max-width="600" v-model="dialog" activator="model">
        <v-card>

            <v-closable-card-title v-model="dialog" :title="$t('Freezer')" :sub-title="$t('FreezerExpiryHelp')"></v-closable-card-title>
            <v-card-text>

                <v-list>
                    <v-list-item v-for="c in categories"
                                 :key="c.name"
                                 :prepend-icon="c.icon"
                                 :title="c.name"
                                 :subtitle="`${c.months} ${$t('Months')}`"
                                 link
                                 @click="date = DateTime.now().plus({months: c.months}).toJSDate(); dialog = false">
                    </v-list-item>
                </v-list>

            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {DateTime} from "luxon";
import {useI18n} from "vue-i18n";
const {t} = useI18n()

const dialog = defineModel<boolean>({})

const date = defineModel<Date>('date', {})

const categories = [
    {name: t('Meat (Beef/Pork)'), months: 12, icon: 'fa-solid fa-drumstick-bite'},
    {name: t('Poultry'), months: 9, icon: 'fa-solid fa-dove'},
    {name: t('Ground Meat'), months: 4, icon: 'fa-solid fa-hamburger'},
    {name: t('Fish (Lean)'), months: 6, icon: 'fa-solid fa-fish'},
    {name: t('Fish (Fatty)'), months: 3, icon: 'fa-solid fa-fish-fins'},
    {name: t('Vegetables'), months: 10, icon: 'fa-solid fa-carrot'},
    {name: t('Fruit'), months: 12, icon: 'fa-solid fa-apple-whole'},
    {name: t('Bread'), months: 3, icon: 'fa-solid fa-bread-slice'},
    {name: t('Pre-cooked Meals'), months: 3, icon: 'fa-solid fa-utensils'},
    {name: t('Soup/Stew'), months: 3, icon: 'fa-solid fa-bowl-food'},
];

</script>

<style scoped>

</style>