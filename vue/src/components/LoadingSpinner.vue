<template>
  <div class="row">
    <div class="col" style="text-align: center">
      <img class="spinner-tandoor" alt="loading spinner" src="" v-bind:style="{ height: size + 'vh' }"/>
    </div>
  </div>
</template>

<script>

export default {
  name: 'LoadingSpinner',
  props: {
    recipe: Object,
    size: {
      type: Number,
      default: 30
    },
  },
}
</script>
