<template>

  <div>

    <h5 class="text-secondary">
      <template v-if="step.name">{{ step.name }}</template>
      <template v-else>{{ _('Step') }} {{index + 1}}</template>
    </h5>

    <div class="row">

      <div class="col-md-3">
        <i class="fa fa-stopwatch"></i> {{ step.time }}

        <table>
          <div v-for="i in step.ingredients" v-bind:key="i.id">
            <Ingredient v-bind:ingredient="i" v-bind:servings="servings"></Ingredient>
          </div>

        </table>
      </div>

      <div class="col-md-9">
        <i class="fas fa-paragraph text-secondary"></i>
        {{ step.instruction }}
      </div>
    </div>


  </div>

</template>

<script>

import Ingredient from "@/components/Ingredient";
import {GettextMixin} from "@/utils/utils";

export default {
  name: 'Step',
  mixins: [
    GettextMixin,
  ],
  components: {
    Ingredient,
  },
  props: {
    step: Object,
    servings: Number,
    index: Number,
  }
}
</script>
