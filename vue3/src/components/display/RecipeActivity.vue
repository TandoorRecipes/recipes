<template>

    <v-card class="mt-1">
        <v-card-title>{{ $t('Activity') }}</v-card-title>
        <v-card-text>

            <v-list>
                <v-list-item v-for="c in cookLogs" :key="c.id">
                    <template #prepend>
                        <v-avatar color="primary">V</v-avatar>
                    </template>
                    <v-list-item-title class="font-weight-bold">{{ c.createdBy.displayName }}
                     <v-rating density="comfortable" size="x-small" color="tandoor" class="float-right" v-model="c.rating"></v-rating>
                    </v-list-item-title>

                    {{ c.comment }}

                    <p v-if="c.servings != null && c.servings > 0">
                        {{ c.servings }}
                        <span v-if="recipe.servingsText != ''">{{ recipe.servingsText }}</span>
                        <span v-else-if="c.servings == 1">{{ $t('Serving') }}</span>
                        <span v-else>{{ $t('Servings') }}</span>
                    </p>

                    <p class="text-disabled">
                        {{ DateTime.fromJSDate(c.createdAt).toLocaleString(DateTime.DATETIME_SHORT) }}
                    </p>
                </v-list-item>
            </v-list>

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