<template>
  <span>
    <b-button v-if="item.icon" class=" btn p-0 border-0" variant="link">
        {{item.icon}}
    </b-button>
  </span>
</template>

<script>

export default {
  name: 'IconBadge',
  props: {
    item: {type: Object}
  },
  data() {
    return {
    }
  },
  mounted() {
  },
  watch: {
  },
  methods: {
  }
}
</script>