<template>
  <div>
    <b-dropdown variant="link" toggle-class="text-decoration-none text-body pr-1" right no-caret>
      <template #button-content>
        <i class="fas fa-ellipsis-v fa-lg"></i>
      </template>
      <b-dropdown-form class="p-1">
        <b-button variant="primary" size="sm" @click="moveLeft" class="float-left"><i
            class="fas fa-arrow-left fa-lg"></i></b-button>
        <b-button variant="primary" size="sm" @click="moveRight" class="float-right"><i
            class="fas fa-arrow-right fa-lg"></i></b-button>
      </b-dropdown-form>
    </b-dropdown>
  </div>
</template>

<script>
export default {
  name: 'MealPlanCardContextMenu',
  props: {
    entry: Object
  },
  methods: {
    moveLeft: function () {
      this.$emit('move-left')
    },
    moveRight: function () {
      this.$emit('move-right')
    }
  }
}
</script>
