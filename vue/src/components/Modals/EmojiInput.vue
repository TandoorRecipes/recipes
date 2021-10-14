<template>
    <div>
        <b-form-group
            v-bind:label="label"
            class="mb-3">
          <twemoji-textarea
            :ref="'_edit_' + id"
            :initialContent="value"
            :emojiData="emojiDataAll"
            :emojiGroups="emojiGroups"
            triggerType="hover"
            :recentEmojisFeat="true"
            recentEmojisStorage="local"
            @contentChanged="setIcon"
           />
        </b-form-group>
    </div>
</template>

<script>
import {TwemojiTextarea} from '@kevinfaguiar/vue-twemoji-picker';
// TODO add localization
import EmojiAllData from '@kevinfaguiar/vue-twemoji-picker/emoji-data/en/emoji-all-groups.json';
import EmojiGroups from '@kevinfaguiar/vue-twemoji-picker/emoji-data/emoji-groups.json';


export default {
  name: 'EmojiInput',
  components: {TwemojiTextarea},
  props: {
    field: {type: String, default: 'You Forgot To Set Field Name'},
    label: {type: String, default: ''},
    value: {type: String, default: ''},
  },
  data() {
    return {
      new_value: undefined,
      id: null
    }
  },
  computed: {
    // modelName() {
    //   return this?.model?.name  ?? this.$t('Search')
    // },
    emojiDataAll() {
      return EmojiAllData;
    },
    emojiGroups() {
      return EmojiGroups;
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
    prepareEmoji: function() {
      this.$refs['_edit_' + this.id].addText(this.this_item.icon || '');
      this.$refs['_edit_' + this.id].blur()
      document.getElementById('btn-emoji-default').disabled = true;
    },
    setIcon: function(icon) {
      this.new_value = icon
    },
  }
}
</script>