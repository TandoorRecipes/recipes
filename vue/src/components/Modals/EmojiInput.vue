<template>
    <div>
        <b-form-group
            v-bind:label="label"
            class="mb-3">

            <input class="form-control" v-model="new_value">

            <Picker :data="emojiIndex" :ref="'_edit_' + id"
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
    },
    data() {
        return {
            new_value: undefined,
            id: null,
            emojiIndex: emojiIndex,
            emojisOutput: ""
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