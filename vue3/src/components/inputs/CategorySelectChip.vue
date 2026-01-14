<template>
    <v-chip label density="compact" class="ms-1" variant="outlined"
            append-icon="fa-solid fa-caret-down" :prepend-icon="TSupermarketCategory.icon">
        {{ $t('Category') }}

        <v-menu activator="parent">
            <v-list density="compact">
                <v-list-item v-for="c in categories" :key="c.id" @click="emit('update', c)">
                    {{ c.name }}
                </v-list-item>
            </v-list>
        </v-menu>
    </v-chip>
</template>

<script setup lang="ts">
import {PropType} from "vue";
import {SupermarketCategory} from "@/openapi";
import {TSupermarketCategory} from "@/types/Models.ts";

const props = defineProps({
    categories: {type: Array as PropType<SupermarketCategory[]>, required: true},
})

const emit = defineEmits(['update'])
</script>
