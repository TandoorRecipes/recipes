<template>
    <div>
        <b-form-group v-bind:label="label" class="mb-3">
            <b-form-input v-model="new_value" type="text" :placeholder="placeholder"></b-form-input>
            <em v-if="help" class="small text-muted">{{ help }}</em>
            <small v-if="subtitle" class="text-muted">{{ subtitle }}</small>
        </b-form-group>
    </div>
</template>

<script>
export default {
    name: "TextInput",
    props: {
        field: { type: String, default: "You Forgot To Set Field Name" },
        label: { type: String, default: "Text Field" },
        value: { type: String, default: "" },
        placeholder: { type: String, default: "You Should Add Placeholder Text" },
        help: { type: String, default: undefined },
        subtitle: { type: String, default: undefined },
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
