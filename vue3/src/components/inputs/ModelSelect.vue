<template>
    <v-input>

        <VueMultiselect
            :id="id"
            v-model="selected_items"
            :options="items"
            :close-on-select="true"
            :clear-on-select="true"
            :hide-selected="multiple"
            :preserve-search="true"
            :internal-search="false"
            :limit="limit"
            :placeholder="model"
            :label="label"
            track-by="id"
            :multiple="multiple"
            :taggable="allowCreate"
            tag-placeholder="TODO CREATE PLACEHOLDER"
            :loading="search_loading"
            @search-change="debouncedSearchFunction"
            @input="selectionChanged"
            @tag="addItem"
            @open="search('')"
            :disabled="disabled"
        >
        </VueMultiselect>
    </v-input>

</template>

<script lang="ts" setup>
import {computed, onMounted, ref, Ref,} from 'vue'
import {ApiApi} from "@/openapi/index.js";
import {useDebounceFn} from "@vueuse/core";
import {GenericModel, getModelFromStr} from "@/types/Models";
import VueMultiselect from 'vue-multiselect'

const props = defineProps(
    {
        model: {type: String, required: true},
        multiple: {type: Boolean, default: true},
        limit: {type: Number, default: 25},
        allowCreate: {type: Boolean, default: false},

        id: {type: String, required: false, default: Math.random().toString()},

        // not verified
        search_on_load: {type: Boolean, default: false},


        clearable: {type: Boolean, default: false,},
        chips: {type: Boolean, default: undefined,},

        itemName: {type: String, default: 'name'},
        itemValue: {type: String, default: 'id'},


        placeholder: {type: String, default: undefined},
        label: {type: String, default: "name"},
        parent_variable: {type: String, default: undefined},

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

const model_class = ref({} as GenericModel<any>)
const items: Ref<Array<any>> = ref([])
const selected_items: Ref<Array<any> | any> = ref(undefined)
const search_query = ref('')
const search_loading = ref(false)


onMounted(() => {
    model_class.value = getModelFromStr(props.model)
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

    search_loading.value = true
    model_class.value.list(query).then(r => {
        items.value = r
        if (props.allowCreate && search_query.value != '') {
            // TODO check if search_query is already in items
            items.value.unshift({id: null, name: `Create "${search_query.value}"`})
        }

    }).catch(err => {
        //useMessageStore().addMessage(MessageType.ERROR, err, 8000)
    }).finally(() => {
        search_loading.value = false
    })
}

function addItem(item: string) {
    console.log("CREATEING NEW with -> ", item)
    const api = new ApiApi()
    api.apiKeywordList()

    model_class.value.create(item).then(createdObj => {
        //StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
        if (selected_items.value instanceof Array) {
            selected_items.value.push(createdObj)
        } else {
            selected_items.value = createdObj
        }
        items.value.push(createdObj)
        selectionChanged()
    }).catch((err) => {
        //StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE)
    }).finally(() => {
        search_loading.value = false
    })
}

function selectionChanged() {
    //this.$emit("change", { var: this.parent_variable, val: this.selected_objects })
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
<style scoped>

</style>