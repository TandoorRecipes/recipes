<template>
    <div>
        <b-form-group v-bind:label="field_label" class="mb-3">
            <b-form-select v-model="new_value" :placeholder="placeholder" :options="translatedOptions"></b-form-select>
        </b-form-group>
    </div>
</template>

<script>
export default {
    name: "ChoiceInput",
    props: {
        field: {type: String, default: "You Forgot To Set Field Name"},
        label: {type: String, default: "Text Field"},
        value: {type: String, default: ""},
        options: [],
        placeholder: {type: String, default: "You Should Add Placeholder Text"},
        show_merge: {type: Boolean, default: false},
        optional: {type: Boolean, default: false},
    },
    data() {
        return {
            new_value: undefined,
        }
    },
    mounted() {
        this.new_value = this.value

        if (this.new_value === "") { // if the selection is empty but the options are of type number, set to 0 instead of ""
            if (typeof this.options[0]['value'] === 'number') {
                this.new_value = 0
            }
        }
    },
    watch: {
        new_value: function () {
            this.$root.$emit("change", this.field, this.new_value)
        },
    },
    computed: {
        field_label: function () {
            if (this.optional) {
                return this.label
            } else {
                return this.label + '*'
            }
        },
        translatedOptions() {
            return this.options.map((x) => {
                return {...x, text: this.$t(x.text)}
            })
        },
    },
    methods: {},
}
</script>
