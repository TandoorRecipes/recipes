<template>
    <div class="row">
      <div class="col" style="text-align: center">
        <i class="fas fa-spinner fa-spin fa-10x"></i>
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
