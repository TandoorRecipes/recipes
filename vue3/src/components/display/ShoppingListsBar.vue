<template>
    <div v-if="props.shoppingLists">
        <slot name="prepend"></slot>

        <v-chip class="me-1 mb-1" :color="shoppingList.color" :size="props.size" :variant="props.variant" label v-for="shoppingList in props.shoppingLists">
            {{ shoppingList.name }}
        </v-chip>

        <slot name="append"></slot>
    </div>

</template>

<script setup lang="ts">

import {Keyword, KeywordLabel, ShoppingList} from "@/openapi";
import {computed, PropType} from "vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

const props = defineProps({
    shoppingLists: Array as PropType<Array<ShoppingList> | undefined>,
    size: {type: String, default: 'x-small'},
    variant: {type: String as PropType<NonNullable<"tonal" | "flat" | "text" | "elevated" | "outlined" | "plain"> | undefined>, default: 'outlined'},
})


</script>
