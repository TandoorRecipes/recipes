<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card :loading="loading">
                    <v-card-title>
                        {{ $t('Search') }}
                    </v-card-title>
                    <v-card-text>
                        <v-form :disabled="loading">
                            <v-text-field :label="$t('Search')" v-model="urlSearchParams.query" clearable></v-text-field>

                            <model-select model="Keyword" mode="tags" v-model="urlSearchParams.keywords" :object="false"></model-select>
                            <model-select model="Food" mode="tags" v-model="urlSearchParams.foods" :object="false"></model-select>
                            <model-select model="Unit" mode="tags" v-model="urlSearchParams.units" :object="false"></model-select>
                            <model-select model="RecipeBook" mode="tags" v-model="urlSearchParams.books" :object="false"></model-select>

                            <!--                            <v-number-input :label="$t('times_cooked')" v-model="searchParameters.timescooked" clearable></v-number-input>-->
                            <!--                            <v-date-input  :label="$t('last_cooked')" v-model="searchParameters.cookedon" clearable></v-date-input>-->
                            <!--                            <v-date-input :label="$t('last_viewed')" v-model="searchParameters.viewedon" clearable></v-date-input>-->
                            <!--                            <v-date-input :label="$t('created_on')" v-model="searchParameters.createdon" clearable></v-date-input>-->
                            <!--                            <v-date-input :label="$t('updatedon')" v-model="searchParameters.updatedon" clearable></v-date-input>-->

                            <v-checkbox :label="$t('make_now')" v-model="urlSearchParams.makenow"></v-checkbox>
                        </v-form>


                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="reset()">{{ $t('Reset') }}</v-btn>
                        <v-btn @click="searchRecipes({page: 1})">{{ $t('Search') }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <v-row v-if="recipes.length > 0">
            <v-col>
                <v-card>
                    <v-data-table-server
                        @update:options="searchRecipes"
                        :loading="loading"
                        :items="recipes"
                        :headers="tableHeaders"
                        :page="urlSearchParams.page"
                        :items-per-page="urlSearchParams.pageSize"
                        :items-length="tableItemCount"
                        @click:row="handleRowClick"
                    >
                        <template #item.image="{item}">
                            <v-avatar :image="item.image"></v-avatar>
                        </template>

                        <template #item.keywords="{item}">
                            <keywords-bar :keywords="item.keywords"></keywords-bar>
                        </template>

                        <template #item.action="{item}">
                            <recipe-context-menu :recipe="item"></recipe-context-menu>
                        </template>
                    </v-data-table-server>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import {ApiApi, ApiRecipeListRequest, RecipeOverview} from "@/openapi";
import {useUrlSearchParams} from "@vueuse/core";
import {useI18n} from "vue-i18n";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {VNumberInput} from 'vuetify/labs/VNumberInput'
import {VDateInput} from 'vuetify/labs/VDateInput'
import RecipeContextMenu from "@/components/inputs/RecipeContextMenu.vue";
import {useRouter} from "vue-router";
import KeywordsBar from "@/components/display/KeywordsBar.vue";
import {VDataTableUpdateOptions} from "@/vuetify";

const {t} = useI18n()
const router = useRouter()
const urlSearchParams = useUrlSearchParams('history', {})

const loading = ref(false)

const tableHeaders = [
    {title: t('Image'), width: '1%', noBreak: true, key: 'image',},
    {title: t('Name'), key: 'name',},
    {title: t('Keywords'), key: 'keywords',},
    {title: t('Actions'), key: 'action', width: '1%', noBreak: true, align: 'end'},
]

const tableItemCount = ref(0)

const recipes = ref([] as RecipeOverview[])

onMounted(() => {
    urlSearchParams.page = 1
})

function searchRecipes(options: VDataTableUpdateOptions) {
    let api = new ApiApi()
    loading.value = true

    urlSearchParams.page = options.page
    if(options.itemsPerPage){
        urlSearchParams.pageSize = options.itemsPerPage
    }

    let searchParameters = {} as ApiRecipeListRequest
    Object.keys(urlSearchParams).forEach(key => {
        searchParameters[key] = urlSearchParams[key]
    })

    api.apiRecipeList(searchParameters).then((r) => {
        recipes.value = r.results
        tableItemCount.value = r.count
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

function reset() {
    Object.keys(urlSearchParams).forEach(key => {
        delete urlSearchParams[key]
    })
    recipes.value = []
}

function handleRowClick(event: PointerEvent, data: any) {
    router.push({name: 'view_recipe', params: {id: recipes.value[data.index].id}})
}

</script>

<style scoped>

</style>