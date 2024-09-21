<template>
    <v-container>
        <v-row>
            <v-col>
                <food-editor :item-id="id"></food-editor>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">

import FoodEditor from "@/components/model_editors/FoodEditor.vue";
import {onMounted, ref} from "vue";
import {ApiApi, Food} from "@/openapi";

const props = defineProps({
    model: {type: String, default: 'Food'},
    id: {type: String, required: true},
})


</script>

<style scoped>

</style>