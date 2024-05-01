<template>
    <v-input>
        <!--        &lt;!&ndash;TODO Problems: 1. behind other cards when those are underneath the element, making card overflow visible breaks cards &ndash;&gt;-->
        <!--        <VueMultiselect-->
        <!--            :id="id"-->
        <!--            v-model="selected_items"-->
        <!--            :options="items"-->
        <!--            :close-on-select="true"-->
        <!--            :clear-on-select="true"-->
        <!--            :hide-selected="multiple"-->
        <!--            :preserve-search="true"-->
        <!--            :internal-search="false"-->
        <!--            :limit="limit"-->
        <!--            :placeholder="model"-->
        <!--            :label="label"-->
        <!--            track-by="id"-->
        <!--            :multiple="multiple"-->
        <!--            :taggable="allowCreate"-->
        <!--            tag-placeholder="TODO CREATE PLACEHOLDER"-->
        <!--            :loading="search_loading"-->
        <!--            @search-change="debouncedSearchFunction"-->
        <!--            @input="selectionChanged"-->
        <!--            @tag="addItem"-->
        <!--            @open="search('')"-->
        <!--            :disabled="disabled"-->
        <!--            class="material-multiselect"-->

        <!--        >-->
        <!--        </VueMultiselect>-->

        <Multiselect

            class="material-multiselect z-max"
            v-model="model"
            :options="search"
            :delay="300"
            :object="true"
            valueProp="id"
            :label="label"
            :searchable="true"
            :strict="false"
            :disabled="disabled"


        />

    </v-input>
</template>

<script lang="ts" setup>
import {computed, onMounted, PropType, ref, Ref} from "vue"
import {ApiApi} from "@/openapi/index.js"
import {useDebounceFn} from "@vueuse/core"
import {GenericModel, getModelFromStr} from "@/types/Models"
import Multiselect from '@vueform/multiselect'

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
    model: {type: String, required: true},

    id: {type: String, required: false, default: Math.random().toString()},

    // not verified

    multiple: {type: Boolean, default: true},
    limit: {type: Number, default: 25},
    allowCreate: {type: Boolean, default: false},

    search_on_load: {type: Boolean, default: false},

    clearable: {type: Boolean, default: false},
    chips: {type: Boolean, default: undefined},

    itemName: {type: String, default: "name"},
    itemValue: {type: String, default: "id"},

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

    disabled: {type: Boolean, default: false},
})

const model = defineModel()
const model_class = ref({} as GenericModel<any>)
const items: Ref<Array<any>> = ref([])
const selected_items: Ref<Array<any> | any> = ref(undefined)
const search_query = ref("")
const search_loading = ref(false)

const elementId = ref((Math.random() * 100000).toString())

onMounted(() => {
    model_class.value = getModelFromStr(props.model)
    if (props.search_on_load) {
        debouncedSearchFunction("")
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
    return model_class.value.list(query).then((r) => {
        return r
    }).catch((err) => {
        //useMessageStore().addMessage(MessageType.ERROR, err, 8000)
    }).finally(() => {
        search_loading.value = false
    })
}

function addItem(item: string) {
    console.log("CREATEING NEW with -> ", item)
    const api = new ApiApi()
    api.apiKeywordList()

    model_class.value.create(item).then((createdObj) => {
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
    emit('update:modelValue', selected_items)
}
</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<style scoped>
.material-multiselect {
    --ms-line-height: 2.5;
    --ms-bg: rgba(235, 235, 235, 0.75);
    --ms-border-color: 0;
    --ms-border-color-active: 0;
    border-bottom: 4px #0f0f0f;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}
</style>
