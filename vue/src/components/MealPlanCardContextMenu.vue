<template>
  <div>
    <b-dropdown variant="link" toggle-class="text-decoration-none text-body pr-1" right no-caret>
      <template #button-content>
        <i class="fas fa-ellipsis-v fa-lg"></i>
      </template>
      <b-dropdown-form class="p-1" form-class="m-0">
        <div class="row no-gutters">
          <div class="col-md-6 text-center">
            <b-button variant="danger" size="sm" @click="deleteEntry"><i
            class="fas fa-trash fa-lg"></i></b-button>
          </div>
        </div>
        <div class="row pt-1  no-gutters">
          <div class="col-md-6 text-center">
            <b-button variant="primary" size="sm" @click="moveLeft"><i
            class="fas fa-arrow-left fa-lg"></i></b-button>
          </div>
          <div class="col-md-6 text-center">
            <b-button variant="primary" size="sm" @click="moveRight"><i
            class="fas fa-arrow-right fa-lg"></i></b-button>
          </div>
        </div>
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
    },
    deleteEntry: function () {
      this.$emit('delete')
    }
  }
}
</script>
