<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card >
                    <v-card-text class="pt-2 pb-2">
                        <v-btn  variant="flat" @click="router.go(-1)" prepend-icon="fa-solid fa-arrow-left">{{ $t('Back')}}</v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <food-editor :item-id="id" v-if="model == 'Food'" @delete="router.go(-1)"></food-editor>
                <unit-editor :item-id="id" v-if="model == 'Unit'" @delete="router.go(-1)"></unit-editor>
                <keyword-editor :item-id="id" v-if="model == 'Keyword'" @delete="router.go(-1)"></keyword-editor>
                <supermarket-editor :item-id="id" v-if="model == 'Supermarket'" @delete="router.go(-1)"></supermarket-editor>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">

import FoodEditor from "@/components/model_editors/FoodEditor.vue";
import {onMounted, ref} from "vue";
import {ApiApi, Food} from "@/openapi";
import {useRouter} from "vue-router";
import UnitEditor from "@/components/model_editors/UnitEditor.vue";
import KeywordEditor from "@/components/model_editors/KeywordEditor.vue";
import SupermarketEditor from "@/components/model_editors/SupermarketEditor.vue";

const props = defineProps({
    model: {type: String, default: 'Food'},
    id: {type: String, required: true},
})

const router = useRouter()

</script>

<style scoped>

</style>