<template>
    <template v-if="allowCreate">
        <v-combobox
            label="Combobox"
            v-model="selected_items"
            v-model:search="search_query"
            @update:search="debouncedSearchFunction"
            :items="items"
            :loading="search_loading"
            :hide-no-data="!(allowCreate && search_query != '')"
            :multiple="multiple"
            :clearable="clearable"
            item-title="name"
            item-value="id"
            :chips="renderAsChips"
            :closable-chips="renderAsChips"
            no-filter
        >

            <template #no-data v-if="allowCreate && search_query != '' && !search_loading && multiple">
                <v-list-item>
                    <v-list-item-title>
                        Press enter to create "<strong>{{ search_query }}</strong>"
                    </v-list-item-title>
                </v-list-item>
            </template>

            <template v-slot:item="{ item, index, props }">
                <v-list-item v-bind="props">
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
            </template>

            <template v-if="renderAsChips" v-slot:chip="{ item, index, props }">
                <v-chip closable>{{ item.title }}</v-chip>
            </template>

        </v-combobox>

    </template>
    <template v-else>

        <v-autocomplete
            label="Autocomplete"
            :items="items"
            :loading="search_loading"
            :multiple="multiple"
            item-title="name"
            item-value="id"
            chips
            closable-chips
            no-filter
            @update:search="debouncedSearchFunction"
        ></v-autocomplete>
    </template>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, Ref, watch} from 'vue'
import {ApiApi} from "@/openapi/index.js";
import {useDebounceFn} from "@vueuse/core";


const props = defineProps(
    {
        search_on_load: {type: Boolean, default: false},
        multiple: {type: Boolean, default: true},
        allowCreate: {type: Boolean, default: false},
        clearable: {type: Boolean, default: false,},
        chips: {type: Boolean, default: undefined,},

        itemName: {type: String, default: 'name'},
        itemValue: {type: String, default: 'id'},

        // old props

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


        disabled: {type: Boolean, default: false,},
    }
)

const items: Ref<Array<any>> = ref([])
const selected_items: Ref<Array<any> | any> = ref(undefined)
const search_query = ref('')
const search_loading = ref(false)

const renderAsChips = computed(() => {
    if (props.chips != undefined) {
        return props.chips
    }
    return props.multiple
})

watch(selected_items, (new_items, old_items) => {
    if (!(new_items instanceof Array) && !(old_items instanceof Array)) {
        //TODO detect creation of single selects
    } else {
        if (old_items == undefined && new_items instanceof Array) {
            old_items = []
        }
        if (new_items == undefined && old_items instanceof Array) {
            new_items = []
        }

        if (old_items.length > new_items.length) {
            // item was removed
        } else if (old_items.length < new_items.length) {
            console.log('items created')
        }
    }


})

onMounted(() => {
    if (props.search_on_load) {
        debouncedSearchFunction('')
    }
})

/**
 * debounced search function bound to search input changing
 */
const debouncedSearchFunction = useDebounceFn((query: string) => {
    search(query)
}, 300)

/**
 * performs the API request to search for the selected input
 * @param query input to search for on the API
 */
function search(query: string) {
    const api = new ApiApi()
    search_loading.value = true
    api.apiFoodList({query: query}).then(r => {
        if (r.results) {
            items.value = r.results
            if (props.allowCreate && search_query.value != '') {
                // TODO check if search_query is already in items
                items.value.unshift({id: null, name: `Create "${search_query.value}"`})
            }
        }
    }).catch(err => {
        //useMessageStore().addMessage(MessageType.ERROR, err, 8000)
    }).finally(() => {
        search_loading.value = false
    })
}

</script>


<style scoped>

</style>