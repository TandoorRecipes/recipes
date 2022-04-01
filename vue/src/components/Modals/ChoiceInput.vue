<template>
    <div>
        <b-form-group v-bind:label="label" class="mb-3">
            <b-form-select v-model="new_value" :placeholder="placeholder" :options="translatedOptions"></b-form-select>
        </b-form-group>
    </div>
</template>

<script>
export default {
    name: "ChoiceInput",
    props: {
        field: { type: String, default: "You Forgot To Set Field Name" },
        label: { type: String, default: "Text Field" },
        value: { type: String, default: "" },
        options: [],
        placeholder: { type: String, default: "You Should Add Placeholder Text" },
        show_merge: { type: Boolean, default: false },
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
    computed: {
        translatedOptions() {
            return this.options.map((x) => {
                return { ...x, text: this.$t(x.text) }
            })
        },
    },
    methods: {},
}
</script>
