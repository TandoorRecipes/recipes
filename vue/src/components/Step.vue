<template>

  <div>

    <h5 class="text-secondary">
      <template v-if="step.name">{{ step.name }}</template>
      <template v-else>{{ _('Step') }} {{ index + 1 }}</template>
    </h5>

    <div class="row">

      <div class="col-md-4">
        <i class="fa fa-stopwatch"></i> {{ step.time }}

        <table class="table table-sm">
          <div v-for="i in step.ingredients" v-bind:key="i.id">
            <Ingredient v-bind:ingredient="i" v-bind:servings="servings"></Ingredient>
          </div>
        </table>
      </div>

      <div class="col-md-8">
        <i class="fas fa-paragraph text-secondary"></i>
        <compile-component :code="step.ingredients_markdown" :servings="servings"></compile-component>

      </div>
    </div>

  </div>

</template>

<script>

import {calculateAmount} from "@/utils/utils";

import Ingredient from "@/components/Ingredient";
import {GettextMixin} from "@/utils/utils";

import CompileComponent from "@/components/CompileComponent";

export default {
  name: 'Step',
  mixins: [
    GettextMixin,
  ],
  components: {
    Ingredient,
    CompileComponent,
  },
  props: {
    step: Object,
    servings: Number,
    index: Number,
  },
  mounted() {

  },
  methods: {
    calculateAmount: function (x) {
      // used by the jinja2 template
      return calculateAmount(x, this.servings)
    }
  }
}
</script>
