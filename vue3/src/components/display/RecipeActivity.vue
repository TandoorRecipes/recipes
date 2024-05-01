<template>

    <v-card class="mt-1">
        <v-card-title>Activity</v-card-title>
        <v-card-text>

            <v-card v-for="c in cookLogs" :key="c.id" class="mt-1">
                <v-card-text>
                    <v-rating density="comfortable" size="x-small" color="tandoor" v-model="c.rating"></v-rating>
                    <br/>
                    <span v-if="c.servings != null && c.servings > 0">{{ c.servings }} <span v-if="recipe.servingsText != ''">{{ recipe.servingsText }}</span><span v-else>Servings</span></span> <br/>

                    {{ c.comment }}
                </v-card-text>
                <v-divider></v-divider>
                <v-card-subtitle>
                    {{ DateTime.fromJSDate(c.createdAt).toLocaleString(DateTime.DATETIME_SHORT) }} by {{ c.createdBy.displayName }}
                </v-card-subtitle>
            </v-card>



        </v-card-text>
    </v-card>


</template>

<script setup lang="ts">

import {onMounted, PropType, ref} from "vue";
import {ApiApi, CookLog, Recipe} from "@/openapi";
import {DateTime} from "luxon";

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true
    },
})

const cookLogs = ref([] as CookLog[])

function refreshActivity() {
    const api = new ApiApi()
    api.apiCookLogList({recipe: props.recipe.id}).then(r => {
        // TODO pagination
        if (r.results) {
            cookLogs.value = r.results
        }
    })
}

function createCookLog(form: any) {
    const api = new ApiApi()
    let cookLog = {
        recipe: props.recipe.id,
        comment: form.data.comment,
        servings: form.data.servings,
        rating: form.data.rating,
    } as CookLog
    api.apiCookLogCreate({cookLogRequest: cookLog}).then(r => {
        console.log('success', r)
    }).catch(err => {
        console.log('error', err)
    })
}

onMounted(() => {
    refreshActivity()
})

</script>

<style scoped>

</style>