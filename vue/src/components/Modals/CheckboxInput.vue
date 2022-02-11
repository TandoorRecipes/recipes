<template>
    <div>
        <b-form-checkbox v-model="new_value">{{ label }}</b-form-checkbox>
        <em v-if="help" class="small text-muted">{{ help }}</em>
    </div>
</template>

<script>
export default {
    name: "CheckboxInput",
    props: {
        field: { type: String, default: "You Forgot To Set Field Name" },
        label: { type: String, default: "Checkbox Field" },
        value: { type: Boolean, default: false },
        show_move: { type: Boolean, default: false },
        show_merge: { type: Boolean, default: false },
        help: { type: String, default: undefined },
    },
    data() {
        return {
            new_value: undefined,
        }
    },
    mounted() {
        this.new_value = this.value
    },
    watch: {
        new_value: function () {
            this.$root.$emit("change", this.field, this.new_value)
        },
    },
    methods: {},
}
</script>
