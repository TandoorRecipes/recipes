<template>
    <div class="row">
      <div class="col" style="text-align: center">
          <img class="spinner-tandoor" alt="loading spinner" src="" style="height: 30vh"/>
      </div>
    </div>
</template>

<script>

export default {
  name: 'LoadingSpinner',
  props: {
    recipe: Object,
  },
}
</script>
