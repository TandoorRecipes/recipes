<template>
    <div v-if="itemList">
        <span :key="k.id" v-for="k in itemList" class="pl-1">
            <b-badge pill :variant="color">{{ thisLabel(k) }}</b-badge>
        </span>
    </div>
</template>

<script>
export default {
    name: "GenericPill",
    props: {
        item_list: { type: Array },
        label: { type: String, default: "name" },
        color: { type: String, default: "light" },
    },
    computed: {
        itemList: function () {
            if (Array.isArray(this.item_list)) {
                return this.item_list
            } else if (!this.item_list?.id) {
                return false
            } else {
                return [this.item_list]
            }
        },
    },
    mounted() {},
    methods: {
        thisLabel: function (item) {
            let fields = this.label.split("::")
            let value = item
            fields.forEach((x) => {
                value = value[x]
            })
            return value
        },
    },
}
</script>
