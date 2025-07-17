import {TandoorPlugin} from '@/types/Plugins.ts'
import {Model, registerModel} from "@/types/Models.ts";
import {defineAsyncComponent} from "vue";

export const plugin: TandoorPlugin = {
    name: 'Open Data Plugin',
    routes: [
        {path: '/open-data/', component: () => import("@/plugins/open_data_plugin/OpenDataPage.vue"), name: 'OpenDataPage'},
    ]
} as TandoorPlugin


// define models below

const TOpenDataFood = {
    name: 'OpenDataFood',
    localizationKey: 'Food',
    localizationKeyDescription: 'FoodHelp',
    icon: 'fa-solid fa-carrot',

    editorComponent: defineAsyncComponent(() => import(`@/plugins/open_data_plugin/components/model_editors/OpenDataFoodEditor.vue`)),

    isPaginated: false,
    isMerge: false,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TOpenDataFood)