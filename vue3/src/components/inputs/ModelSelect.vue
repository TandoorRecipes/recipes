<template>
    <template v-if="allow_create">
        Combobox
        <v-combobox
            label="Combobox"
            :items="items"
            item-title="name"
            item-value="id"
            chips
            @update:search="search"
        ></v-combobox>

    </template>
    <template v-else>
        Autocomplete
        <v-autocomplete
            label="Autocomplete"
            :items="items"
            item-title="name"
            item-value="id"
            chips
        ></v-autocomplete>
    </template>
</template>

<script lang="ts" setup>
import {ref, onMounted} from 'vue'
import {ApiApi} from "@/openapi/index.js";

const props = defineProps(
    {
        placeholder: {type: String, default: undefined},
        model: {
            type: String,
            required: true,
        },
        label: {type: String, default: "name"},
        parent_variable: {type: String, default: undefined},
        limit: {type: Number, default: 25},
        sticky_options: {
            type: Array,
            default() {
                return []
            },
        },
        initial_selection: {
            type: Array,
            default() {
                return []
            },
        },
        initial_single_selection: {
            type: Object,
            default: undefined,
        },
        search_on_load: {type: Boolean, default: true},
        multiple: {type: Boolean, default: true},
        allow_create: {type: Boolean, default: false},
        create_placeholder: {type: String, default: "You Forgot to Add a Tag Placeholder"},
        clear: {type: Number},
        disabled: {type: Boolean, default: false,},
    }
)

const items = ref([])

function genericApiCall(model: string, query: string) {
    // TODO make mode an enum
    // TODO make model an enum as well an manually "clear" allowed types?
    const api = new ApiApi()

    api[`api${model}List`]({page: 1, query: query}).then(r => {
        this.items = r.results
    })
}

function search(query: string) {

}

// lifecycle hooks
onMounted(() => {
    console.log(`The initial count is ${items}.`)
})
</script>


<style scoped>

</style>