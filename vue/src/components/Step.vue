<template>

  <div>

    <h5 class="text-secondary">
      <template v-if="step.name">{{ step.name }}</template>
      <template v-else>{{ _('Step') }} {{ index + 1 }}</template>
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
        <span v-html="step.ingredients_markdown">

        </span>

         <compile-component :code="step.ingredients_markdown" :servings="servings"></compile-component>
      </div>
    </div>

  </div>

</template>

<script>

import {calculateAmount} from "@/utils/utils";

import Ingredient from "@/components/Ingredient";
import {GettextMixin} from "@/utils/utils";
import ScalableNumber from "@/components/ScalableNumber";

import CompileComponent from "@/components/CompileComponent";

export default {
  name: 'Step',
  mixins: [
    GettextMixin,
  ],
  components: {
    Ingredient,
    CompileComponent, //eslint-disable-line
    ScalableNumber, // eslint-disable-line
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
