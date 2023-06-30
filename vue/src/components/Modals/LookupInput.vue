<template>
    <div>
        <b-form-group :class="class_list">
            <template #label v-if="show_label">
                {{ field_label }}
            </template>
            <generic-multiselect
                @change="new_value = $event.val"
                @remove="new_value = undefined"
                :initial_selection="initialSelection"
                :initial_single_selection="initialSingleSelection"
                :model="model"
                :multiple="useMultiple || false"
                :sticky_options="sticky_options"
                :allow_create="form.allow_create"
                :create_placeholder="createPlaceholder"
                :clear="clear"
                :label="list_label"
                style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                :placeholder="modelName"
            >
            </generic-multiselect>
            <em v-if="help" class="small text-muted">{{ help }}</em>
        </b-form-group>
    </div>
</template>

<script>
import GenericMultiselect from "@/components/GenericMultiselect"
import {StandardToasts, ApiMixin} from "@/utils/utils"

export default {
    name: "LookupInput",
    components: {GenericMultiselect},
    mixins: [ApiMixin],
    props: {
        form: {
            type: Object,
            default() {
                return undefined
            },
        },
        model: {
            type: Object,
            default() {
                return undefined
            },
        },
        class_list: {type: String, default: "mb-3"},
        show_label: {type: Boolean, default: true},
        clear: {type: Number},
        help: {type: String, default: undefined},
        optional: {type: Boolean, default: false},
    },

    data() {
        return {
            new_value: undefined,
            field: undefined,
            label: undefined,
            list_label: undefined,
            sticky_options: undefined,
            first_run: true,
        }
    },
    mounted() {
        this.new_value = this.form?.value
        this.field = this.form?.field ?? "You Forgot To Set Field Name"
        this.label = this.form?.label ?? ""
        this.sticky_options = this.form?.sticky_options ?? []
        this.sticky_options = this.sticky_options.map((x) => {
            return {...x, name: this.$t(x.name)}
        })
        this.list_label = this.form?.list_label ?? undefined
        if (this.list_label?.includes("::")) {
            this.list_label = this.list_label.split("::")[1]
        }
    },
    computed: {
        field_label: function () {
            if (this.optional) {
                return this.form.label
            } else {
                return this.form.label + '*'
            }
        },
        modelName() {
            return this.$t(this?.model?.name) ?? this.$t("Search")
        },
        useMultiple() {
            return this.form?.multiple || this.form?.ordered || false
        },
        initialSelection() {
            if (!this.new_value || !this.useMultiple) {
                return undefined
            }

            if (this.form?.ordered && this.first_run) {
                return this.flattenItems(this.new_value)
            } else {
                return this.new_value
            }
        },
        initialSingleSelection() {
            if (this.useMultiple) {
                return undefined
            } else {
                return this.new_value
            }
        },
        createPlaceholder() {
            return this.$t("Create_New_" + this?.model?.name)
        },
    },
    watch: {
        "form.value": function (newVal, oldVal) {
            this.new_value = newVal
        },
        new_value: function () {
            let x = this?.new_value
            // pass the unflattened attributes that can be restored when ready to save/update
            if (this.form?.ordered) {
                x["__override__"] = this.unflattenItem(this?.new_value)
            }
            this.$root.$emit("change", this.form.field, x)
            this.$emit("change", x)
        },
    },
    methods: {
        // ordered lookups have nested attributes that need flattened attributes to drive lookup
        flattenItems: function (itemlist) {
            let flat_items = []
            let item = undefined
            let label = this.form.list_label.split("::")
            itemlist.forEach((x) => {
                item = {...x}
                for (const [k, v] of Object.entries(x)) {
                    if (k == label[0]) {
                        item["id"] = v.id
                        item[label[1]] = v[label[1]]
                    } else {
                        item[this.form.field + "__" + k] = v
                    }
                }
                flat_items.push(item)
            })
            this.first_run = false

            return flat_items
        },
        unflattenItem: function (itemList) {
            let unflat_items = []
            let item = undefined
            let label = this.form.list_label.split("::")
            let order = 0
            let this_label
            itemList.forEach((x) => {
                item = {}
                item[label[0]] = {}
                for (const [k, v] of Object.entries(x)) {
                    switch (k) {
                        case "id":
                            item[label[0]]["id"] = v
                            break
                        case label[1]:
                            item[label[0]][label[1]] = v
                            break
                        default:
                            this_label = k.replace(this.form.field + "__", "")
                    }
                }
                item["order"] = order
                order++
                unflat_items.push(item)
            })
            return unflat_items
        },
    },
}
</script>
