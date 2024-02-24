<template>

    <v-container>
        <v-row>
            <v-col>
                <h2>Activity</h2>
                <v-timeline side="end" align="start">
                    <v-timeline-item dot-color="grey" size="xsmall" v-for="c in cook_logs" :key="c.id">
                        <v-card>
                            <v-card-text class="bg-primary"><small>{{ c.createdAt }} by {{ c.createdBy.displayName }}</small></v-card-text>

                            <v-rating density="compact" size="small" color="tandoor" v-model="c.rating"></v-rating>
                            <span v-if="c.servings != null && c.servings > 0">{{ c.servings }} {{ recipe.servingsText }}</span>
                            <p>
                                {{ c.comment }}
                            </p>
                        </v-card>

                    </v-timeline-item>
                </v-timeline>
            </v-col>
        </v-row>


    </v-container>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {ApiApi, CookLog, Recipe} from "@/openapi";

export default defineComponent({
    name: "RecipeActivity",
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true
        },
    },
    data() {
        return {
            cook_logs: [] as CookLog[]
        }
    },
    mounted() {
        const api = new ApiApi()
        api.listCookLogs({recipe: this.recipe.id}).then(r => {
            // TODO pagination
            this.cook_logs = r.results
        })
    },
})
</script>

<style scoped>

</style>