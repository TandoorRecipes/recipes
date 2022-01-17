<template>
    <b-input-group class="mt-2">
        <treeselect
            v-model="selected1"
            :options="options"
            :load-options="loadChildren"
            :multiple="true"
            :flat="true"
            :auto-load-root-options="false"
            searchNested
            :placeholder="placeholder"
            :normalizer="normalizer"
            @input="change"
            style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
        />
        <b-input-group-append>
            <b-input-group-text>
                <b-form-checkbox v-model="or1" name="check-button" @change="orChange()" class="shadow-none" switch>
                    <span class="text-uppercase" v-if="or1">{{ $t("or") }}</span>
                    <span class="text-uppercase" v-else>{{ $t("and") }}</span>
                </b-form-checkbox>
            </b-input-group-text>
        </b-input-group-append>
    </b-input-group>
</template>

<script>
import { ApiMixin } from "@/utils/utils"
import { Treeselect, LOAD_CHILDREN_OPTIONS } from "@riophae/vue-treeselect"
import "@riophae/vue-treeselect/dist/vue-treeselect.css"

export default {
    name: "AdvancedTreeSelect",
    props: {
        initial_selected1: { type: Array },
        initial_selected2: { type: Array },
        initial_selected3: { type: Array },
        placeholder: { type: String, default: "You forgot to set placeholder" },
        options: { type: Array },
        facet: { type: String, default: undefined },
    },
    components: { Treeselect },
    data() {
        return {
            selected1: [],
            selected2: [],
            selected3: [],
            callbacks: [],
            or1: true,
        }
    },
    mounted() {},
    computed: {},
    watch: {
        selected1: function (newVal, oldVal) {
            this.$emit("change", newVal)
        },
        initial_selected1: {
            handler() {
                console.log("test")
                this.selected1 = this.initial_selected1
            },
            deep: true,
        },
        options: function () {
            this.callbacks.forEach((callback) => {
                callback()
            })
        },
    },
    methods: {
        loadChildren: function ({ action, parentNode, callback }) {
            if (action === LOAD_CHILDREN_OPTIONS) {
                this.callbacks.push(callback)
                this.$emit("load-children", { type: "keyword", parent: parentNode.id })
            }
        },
        normalizer(node) {
            let count = node?.count ? " (" + node.count + ")" : ""
            return {
                id: node.id,
                label: node.name + count,
                children: node.children,
                isDefaultExpanded: node.isDefaultExpanded,
            }
        },
        orChange: function () {
            console.log("changed!")
        },
        change: function (e) {
            console.log(e)
        },
    },
}
</script>
