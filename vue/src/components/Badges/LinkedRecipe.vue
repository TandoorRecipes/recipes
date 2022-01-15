<template>
  <span>
    <b-button v-if="item.recipe" v-b-tooltip.hover :title="item.recipe.name"
                  class=" btn text-decoration-none fas fa-book-open px-1 py-0 border-0" variant="link" :href="item.recipe.url"/>
  </span>
</template>

<script>

export default {
  name: 'LinkedRecipeBadge',
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