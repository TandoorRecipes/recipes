<template>
    <div>
        <b-form-group v-bind:label="field_label" class="mb-3">
            <b-form-input v-model="new_value" type="number" :placeholder="placeholder"></b-form-input>
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
        value: { type: Number, default: 0 },
        placeholder: { type: Number, default: 0 },
        help: { type: String, default: undefined },
        subtitle: { type: String, default: undefined },
        optional: {type: Boolean, default: false},
    },
    computed: {
        field_label: function () {
            if (this.optional) {
                return this.label
            } else {
                return this.label + '*'
            }
        }
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
