<template>
    <div v-if="recipe.keywords.length > 0">
      <span :key="k.id" v-for="k in recipe.keywords" class="pl-1">
        <b-badge pill variant="light" class="font-weight-normal">{{k.label}}</b-badge>
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
