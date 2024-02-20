<template>
  <div class="last-cooked">
    <span class="pl-1" v-if="recipe.last_cooked !== undefined && recipe.last_cooked !== null">
    <b-badge pill variant="primary" class="font-weight-normal"><i class="fas fa-utensils"></i> {{
        formatDate(recipe.last_cooked)
      }}</b-badge>
    </span>
  </div>
</template>

<script>
import moment from "moment/moment";

export default {
  name: "LastCooked",
  props: {
    recipe: Object
  },
  methods: {
    formatDate: function (datetime) {
      moment.locale(window.navigator.language);
      return moment(datetime).format('L')
    }
  }
}
</script>

<style scoped>

</style>