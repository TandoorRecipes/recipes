import {TandoorPlugin} from '@/types/Plugins.ts'
import {Model, registerModel} from "@/types/Models.ts";
import {defineAsyncComponent} from "vue";
import {VListItem} from "vuetify/components";

export const plugin: TandoorPlugin = {
    name: 'Open Data Plugin',
    basePath: 'open_data_plugin',
    defaultLocale: import(`@/plugins/open_data_plugin/locales/en.json`),
    localeFiles: import.meta.glob('@/plugins/open_data_plugin/locales/*.json'),
    routes: [
        {path: '/open-data/', component: () => import("@/plugins/open_data_plugin/pages/OpenDataPage.vue"), name: 'OpenDataPage'},
    ],
    navigationDrawer: [],
    bottomNavigation: [],
    userNavigation: [
        {component: VListItem, prependIcon: 'fa-solid fa-folder-tree', title: 'OpenData', to: {name: 'OpenDataPage', params: {}}},
    ],
} as TandoorPlugin


// define models below

const TOpenDataVersion = {
    name: 'OpenDataVersion',
    localizationKey: 'Version',
    localizationKeyDescription: 'OpenDataVersionHelp',
    icon: 'fa-solid fa-hashtag',

    editorComponent: defineAsyncComponent(() => import(`@/plugins/open_data_plugin/components/model_editors/OpenDataVersionEditor.vue`)),

    isPaginated: true,
    isMerge: false,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TOpenDataVersion)

const TOpenDataUnit = {
    name: 'OpenDataUnit',
    localizationKey: 'Unit',
    localizationKeyDescription: 'UnitHelp',
    icon: 'fa-solid fa-scale-balanced',

    editorComponent: defineAsyncComponent(() => import(`@/plugins/open_data_plugin/components/model_editors/OpenDataUnitEditor.vue`)),

    isPaginated: true,
    isMerge: false,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TOpenDataUnit)

const TOpenDataCategory = {
    name: 'OpenDataCategory',
    localizationKey: 'Category',
    localizationKeyDescription: 'SupermarketCategoryHelp',
    icon: 'fa-solid fa-boxes-stacked',

    editorComponent: defineAsyncComponent(() => import(`@/plugins/open_data_plugin/components/model_editors/OpenDataCategoryEditor.vue`)),

    isPaginated: true,
    isMerge: false,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TOpenDataCategory)

const TOpenDataProperty = {
    name: 'OpenDataProperty',
    localizationKey: 'Property',
    localizationKeyDescription: 'PropertyTypeHelp',
    icon: 'fa-solid fa-database',

    editorComponent: defineAsyncComponent(() => import(`@/plugins/open_data_plugin/components/model_editors/OpenDataPropertyEditor.vue`)),

    isPaginated: true,
    isMerge: false,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TOpenDataProperty)

const TOpenDataFood = {
    name: 'OpenDataFood',
    localizationKey: 'Food',
    localizationKeyDescription: 'FoodHelp',
    icon: 'fa-solid fa-carrot',

    editorComponent: defineAsyncComponent(() => import(`@/plugins/open_data_plugin/components/model_editors/OpenDataFoodEditor.vue`)),

    isPaginated: true,
    isMerge: false,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Category', key: 'storeCategory.name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TOpenDataFood)


const TOpenDataConversion = {
    name: 'OpenDataConversion',
    localizationKey: 'UnitConversion',
    localizationKeyDescription: 'UnitConversionHelp',
    icon: 'fa-solid fa-exchange-alt',

    editorComponent: defineAsyncComponent(() => import(`@/plugins/open_data_plugin/components/model_editors/OpenDataConversionEditor.vue`)),

    isPaginated: true,
    isMerge: false,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Food', key: 'food.name'},
        {title: 'base_amount', key: 'baseAmount'},
        {title: 'base_unit', key: 'baseUnit.name'},
        {title: 'converted_amount', key: 'convertedAmount'},
        {title: 'converted_unit', key: 'convertedUnit.name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TOpenDataConversion)

