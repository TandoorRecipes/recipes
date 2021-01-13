<template>
    <div v-if="recipe.keywords.length > 0">
      <small :key="k.id" v-for="k in recipe.keywords" style="padding: 2px">
        {{k.icon}} {{k.name}}
      </small>
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
