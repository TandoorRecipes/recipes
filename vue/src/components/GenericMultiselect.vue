<template>
    <multiselect
        :id="id"
        v-model="selected_objects"
        :options="objects"
        :close-on-select="true"
        :clear-on-select="multiple"
        :hide-selected="multiple"
        :preserve-search="true"
        :internal-search="false"
        :limit="limit"
        :placeholder="lookupPlaceholder"
        :label="label"
        track-by="id"
        :multiple="multiple"
        :taggable="allow_create"
        :tag-placeholder="create_placeholder"
        :loading="loading"
        @search-change="search"
        @input="selectionChanged"
        @tag="addNew"
    >
    </multiselect>
</template>

<script>
import Vue from "vue"
import Multiselect from "vue-multiselect"
import { ApiMixin } from "@/utils/utils"

export default {
    name: "GenericMultiselect",
    components: { Multiselect },
    mixins: [ApiMixin],
    data() {
        return {
            // this.Models and this.Actions inherited from ApiMixin
            id: undefined,
            loading: false,
            objects: [],
            selected_objects: undefined,
        }
    },
    props: {
        placeholder: { type: String, default: undefined },
        model: {
            type: Object,
            default() {
                return {}
            },
        },
        label: { type: String, default: "name" },
        parent_variable: { type: String, default: undefined },
        limit: { type: Number, default: 25 },
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
        multiple: { type: Boolean, default: true },
        allow_create: { type: Boolean, default: false },
        create_placeholder: { type: String, default: "You Forgot to Add a Tag Placeholder" },
        clear: { type: Number },
    },
    watch: {
        initial_selection: function (newVal, oldVal) {
            // watch it
            this.selected_objects = newVal
            let get_details = []
            let empty = {}
            empty[this.label] = `..${this.$t("loading")}..`
            this.selected_objects.forEach((x) => {
                if (typeof x !== "object") {
                    this.selected_objects[this.selected_objects.indexOf(x)] = { ...empty, id: x }
                    get_details.push(x)
                }
            })
            get_details.forEach((x) => {
                this.genericAPI(this.model, this.Actions.FETCH, { id: x })
                    .then((result) => {
                        // this.selected_objects[this.selected_objects.map((y) => y.id).indexOf(x)] = result.data
                        Vue.set(this.selected_objects, this.selected_objects.map((y) => y.id).indexOf(x), result.data)
                    })
                    .catch((err) => {
                        this.selected_objects = this.selected_objects.filter((y) => y.id !== x)
                    })
            })
        },
        initial_single_selection: function (newVal, oldVal) {
            // watch it
            this.selected_objects = newVal
            if (typeof this.selected_objects !== "object") {
                let empty = {}
                empty[this.label] = `..${this.$t("loading")}..`
                this.selected_objects = { ...empty, id: this.selected_objects }
                this.genericAPI(this.model, this.Actions.FETCH, { id: this.selected_objects })
                    .then((result) => {
                        this.selected_objects = result.data
                    })
                    .catch((err) => {
                        this.selected_objects = undefined
                    })
            }
        },
        clear: function (newVal, oldVal) {
            if (this.multiple || !this.initial_single_selection) {
                this.selected_objects = []
            } else {
                this.selected_objects = undefined
            }
        },
    },
    mounted() {
        this.id = Math.random()
        this.search("")
        if (this.multiple || !this.initial_single_selection) {
            this.selected_objects = this.initial_selection
        } else {
            this.selected_objects = this.initial_single_selection
        }
    },
    computed: {
        lookupPlaceholder() {
            return this.placeholder || this.model.name || this.$t("Search")
        },
        nothingSelected() {
            if (this.multiple || !this.initial_single_selection) {
                return this.selected_objects.length === 0 && this.initial_selection.length === 0
            } else {
                return !this.selected_objects && !this.initial_single_selection
            }
        },
    },
    methods: {
        // this.genericAPI inherited from ApiMixin
        search: function (query) {
            let options = {
                page: 1,
                pageSize: this.limit,
                query: query,
                limit: this.limit,
            }
            this.genericAPI(this.model, this.Actions.LIST, options).then((result) => {
                this.objects = this.sticky_options.concat(result.data?.results ?? result.data)
                if (this.nothingSelected && this.objects.length > 0) {
                    this.objects.forEach((item) => {
                        // select default items when present in object
                        if ("default" in item) {
                            if (item.default) {
                                if (this.multiple) {
                                    this.selected_objects = [item]
                                } else {
                                    this.selected_objects = item
                                }
                                this.selectionChanged()
                            }
                        }
                    })
                }
            })
        },
        selectionChanged: function () {
            this.$emit("change", { var: this.parent_variable, val: this.selected_objects })
        },
        addNew(e) {
            this.$emit("new", e)
            // could refactor as Promise - seems unnecessary
            setTimeout(() => {
                this.search("")
            }, 750)
        },
    },
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style scoped></style>
