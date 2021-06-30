<template>
    <div v-if="recipe.keywords.length > 0">
      <span :key="k.id" v-for="k in recipe.keywords" style="padding: 2px">
        <b-badge pill variant="light">{{k.label}}</b-badge>
      </span>
    </div>
</template>

<script>

export default {
  name: 'Keywords',
  props: {
    recipe: Object,
  },
}
</script>
