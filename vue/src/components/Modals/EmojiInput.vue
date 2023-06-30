<template>
    <div>
        <b-form-group
            v-bind:label="field_label"
            class="mb-3">

            <input class="form-control" v-model="new_value">

            <Picker :data="emojiIndex" :ref="'_edit_' + id" :native="true"
                    @select="setIcon"/>

        </b-form-group>
    </div>
</template>

<script>

import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import {Picker, EmojiIndex} from "emoji-mart-vue-fast";
let emojiIndex = new EmojiIndex(data);

export default {
    name: 'EmojiInput',
    components: {Picker},
    props: {
        field: {type: String, default: 'You Forgot To Set Field Name'},
        label: {type: String, default: ''},
        value: {type: String, default: ''},
        optional: {type: Boolean, default: false},
    },
    data() {
        return {
            new_value: undefined,
            id: null,
            emojiIndex: emojiIndex,
            emojisOutput: ""
        }
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
    watch: {
        'new_value': function () {
            this.$root.$emit('change', this.field, this.new_value ?? null)
        },
    },
    mounted() {
        this.id = this._uid
    },
    methods: {
        setIcon: function (icon) {
            console.log(icon)
            this.new_value = icon.native
        },
    }
}
</script>