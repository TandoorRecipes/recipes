<template>
    <draggable v-if="itemList" v-model="this_list" tag="span" group="ordered_items" z-index="500" @change="orderChanged">
        <span :key="k.id" v-for="k in itemList" class="pl-1">
            <b-badge squared :variant="color"
                ><i class="fas fa-grip-lines-vertical text-muted"></i><span class="ml-1">{{ thisLabel(k) }}</span></b-badge
            >
        </span>
    </draggable>
</template>

<script>
// you can't use this component with a horizontal card that is also draggable
import draggable from "vuedraggable"

export default {
    name: "GenericOrderedPill",
    components: { draggable },
    props: {
        item_list: {
            type: Array,
            default() {
                return []
            },
        },
        label: { type: String, default: "name" },
        color: { type: String, default: "light" },
        field: { type: String, required: true },
        item: { type: Object },
    },
    data() {
        return {
            this_list: [],
        }
    },
    computed: {
        itemList: function() {
            if (Array.isArray(this.this_list)) {
                return this.this_list
            } else if (!this.this_list?.name) {
                return false
            } else {
                return [this.this_list]
            }
        },
    },
    mounted() {
        this.this_list = this.item_list
    },
    watch: {
        item_list: function(newVal) {
            this.this_list = newVal
        },
    },
    methods: {
        thisLabel: function(item) {
            let fields = this.label.split("::")
            let value = item
            fields.forEach((x) => {
                value = value[x]
            })
            return value
        },
        orderChanged: function(e) {
            let order = 0
            this.this_list.forEach((x) => {
                x["order"] = order
                order++
            })
            let new_order = { ...this.item }
            new_order[this.field] = this.this_list
            this.$emit("finish-action", { action: "save", form_data: new_order })
        },
    },
}
</script>
