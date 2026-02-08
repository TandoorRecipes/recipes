<template>
    <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500px">
        <v-card>
            <v-closable-card-title :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" :title="$t('Freezer Expiry Calculator')" icon="fa-solid fa-snowflake"></v-closable-card-title>
            <v-card-subtitle>
                {{ $t('Select category to calculate expiry date') }}
            </v-card-subtitle>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
                <v-list lines="two" hover>
                    <v-list-item v-for="category in categories" :key="category.name" @click="selectCategory(category)">
                        <template #prepend>
                            <v-avatar color="info" variant="tonal">
                                <v-icon :icon="category.icon"></v-icon>
                            </v-avatar>
                        </template>
                        <v-list-item-title class="font-weight-bold">{{ $t(category.name) }}</v-list-item-title>
                        <v-list-item-subtitle>
                            {{ category.months }} {{ $t('Months') }}
                        </v-list-item-subtitle>
                        <template #append>
                            <v-chip size="small" color="info" variant="flat">
                                +{{ category.months }}m
                            </v-chip>
                        </template>
                    </v-list-item>
                </v-list>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="text" @click="emit('update:modelValue', false)">{{ $t('Close') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";

const props = defineProps({
    modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'select']);

const categories = [
    { name: 'Meat (Beef/Pork)', months: 12, icon: 'fa-solid fa-drumstick-bite' },
    { name: 'Poultry', months: 9, icon: 'fa-solid fa-kiwi-bird' }, // kiwibird is closest to poultry icon in some sets, but let's use drumstick-bite for meat/poultry
    { name: 'Ground Meat', months: 4, icon: 'fa-solid fa-meat' }, // meat icon if available
    { name: 'Fish (Lean)', months: 6, icon: 'fa-solid fa-fish' },
    { name: 'Fish (Fatty)', months: 3, icon: 'fa-solid fa-fish-fins' },
    { name: 'Vegetables', months: 10, icon: 'fa-solid fa-carrot' },
    { name: 'Fruit', months: 12, icon: 'fa-solid fa-apple-whole' },
    { name: 'Bread', months: 3, icon: 'fa-solid fa-bread-slice' },
    { name: 'Pre-cooked Meals', months: 3, icon: 'fa-solid fa-utensils' },
    { name: 'Soup/Stew', months: 3, icon: 'fa-solid fa-bowl-food' },
];

// Update icons where specialized ones are better
categories[1].icon = 'fa-solid fa-dove'; // poultry
categories[2].icon = 'fa-solid fa-hamburger'; // ground meat

const selectCategory = (category: any) => {
    emit('select', category.months * 30); // Approximate months to days
    emit('update:modelValue', false);
};
</script>
