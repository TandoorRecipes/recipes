<!-- WIP component that does not really work, that's why vue-multiselect is temporarily used -->

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
            :chips="multiple"
            :closable-chips="multiple"
            no-filter
        >

            <template #no-data v-if="allowCreate && search_query != '' && !search_loading && multiple">
                <v-list-item>
                    <v-list-item-title>
                        Press enter to create "<strong>{{ search_query }}</strong>"
                    </v-list-item-title>
                </v-list-item>
            </template>

            <!--            <template v-slot:item="{ item, index, props }">-->
            <!--                <v-list-item v-bind="props">-->

            <!--                </v-list-item>-->
            <!--            </template>-->

            <template v-if="multiple" v-slot:chip="{ item, index, props }">
                <v-chip closable>{{ item.title }}</v-chip>
            </template>

        </v-combobox>

    </template>
    <template v-else>

        <v-autocomplete
            label="Autocomplete"
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
            :chips="multiple"
            :closable-chips="multiple"
            no-filter
        ></v-autocomplete>
    </template>
</template>

<script lang="ts" setup>
import {computed, onMounted, PropType, ref, Ref, watch} from 'vue'
import {ApiApi} from "@/openapi/index.js";
import {useDebounceFn} from "@vueuse/core";
import {Models} from "@/types/Models";
import {VAutocomplete, VCombobox} from "vuetify/components";


const props = defineProps(
    {
        search_on_load: {type: Boolean, default: false},
        multiple: {type: Boolean, default: true},
        allowCreate: {type: Boolean, default: false},
        clearable: {type: Boolean, default: false,},
        chips: {type: Boolean, default: undefined,},

        itemName: {type: String, default: 'name'},
        itemValue: {type: String, default: 'id'},
        model: {type: String as PropType<Models>, required: true},


        // old props


        placeholder: {type: String, default: undefined},
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


/**
 * watch selected items to detect if new items were added or old items removed
 */
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
    api[`api${props.model}List`]({query: query}).then(r => {
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