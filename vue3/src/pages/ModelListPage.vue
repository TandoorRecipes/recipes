<template>
    <v-container>
        <v-row>
            <v-col>
                <span class="text-h4">
                    <v-btn icon="fa-solid fa-caret-down" variant="tonal">
                        <i class="fa-solid fa-caret-down"></i>
                        <v-menu activator="parent">
                            <v-list>

                                <v-list-item
                                    v-for="model in [TFood, TUnit, TKeyword,TSupermarket, TSupermarketCategory, TPropertyType, TUnitConversion, TAutomation, TUserFile, TCookLog, TViewLog]"
                                    :to="{name: 'ModelListPage', params: {model: model.name}}"
                                >
                                     <template #prepend><v-icon :icon="model.icon"></v-icon> </template>
                                     {{ $t(model.localizationKey) }}
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-btn>
                    <v-icon :icon="genericModel.model.icon"></v-icon>
                    {{ $t(genericModel.model.localizationKey) }}</span>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field prepend-inner-icon="$search" :label="$t('Search')" v-model="searchQuery"></v-text-field>
                <v-data-table-server
                    @update:options="loadItems"
                    :items="items"
                    :items-length="itemCount"
                    :loading="loading"
                    :search="searchQuery"

                    :headers="tableHeaders"
                    :items-per-page-options="itemsPerPageOptions"
                    :show-select="tableShowSelect"
                >
                    <template v-slot:item.action="{ item }">
                        <v-btn color="edit" :to="{name: 'ModelEditPage', params: {model: model, id: item.id}}">
                            <v-icon icon="$edit"></v-icon>
                        </v-btn>
                    </template>
                </v-data-table-server>
            </v-col>
        </v-row>

    </v-container>


</template>

<script setup lang="ts">


import {onBeforeMount, onMounted, ref, watch} from "vue";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {useI18n} from "vue-i18n";
import {
    TFood,
    TUnit,
    GenericModel,
    getGenericModelFromString,
    TKeyword,
    TSupermarketCategory,
    TPropertyType,
    TSupermarket,
    TUnitConversion,
    TAutomation,
    TUserFile, TCookLog, TViewLog
} from "@/types/Models";
import {ca} from "vuetify/locale";
import {ApiApi} from "@/openapi";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import ModelEditorDialog from "@/components/dialogs/ModelEditorDialog.vue";

const {t} = useI18n()

const props = defineProps({
    model: {type: String, default: 'Food'},
})

// table config
const itemsPerPageOptions = [
    {value: 10, title: '10'},
    {value: 25, title: '25'},
    {value: 50, title: '50'},
]

const tableHeaders = [
    {title: t('Name'), key: 'name'},
    {title: t('Category'), key: 'supermarketCategory.name'},
    {title: t('Edit'), key: 'action', align: 'end'},
]

const tableShowSelect = ref(true)

// data
const loading = ref(false);
const items = ref([] as Array<any>)
const itemCount = ref(0)
const searchQuery = ref('')

const genericModel = ref({} as GenericModel)


// watch for changes to the prop in case its changed
watch(() => props.model, () => {
    console.log('loading model ', props.model)
    genericModel.value = getGenericModelFromString(props.model)
    loadItems({page: 1, itemsPerPage: 10})
})

/**
 * select model class before mount because template renders (and requests item load) before onMounted is called
 */
onBeforeMount(() => {

    try {
        genericModel.value = getGenericModelFromString(props.model)
    } catch (Error) {
        console.error('Invalid model passed to ModelListPage, loading Food instead')
        genericModel.value = getGenericModelFromString('Food')
    }
})

function loadItems({page, itemsPerPage, search, sortBy, groupBy}) {
    loading.value = true

    genericModel.value.list({page: page, pageSize: itemsPerPage, query: search}).then(r => {
        items.value = r.results
        itemCount.value = r.count
    }).catch((err: any) => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

</script>

<style scoped>

</style>