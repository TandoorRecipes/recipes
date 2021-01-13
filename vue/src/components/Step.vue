<template>

  <div>
    <hr/>
    <template v-if="step.type === 'TEXT'">
      <div class="row">
        <div class="col col-md4">
          <h5 class="text-primary">
            <template v-if="step.name">{{ step.name }}</template>
            <template v-else>{{ _('Step') }} {{ index + 1 }}</template>

            <small style="margin-left: 4px" class="text-muted" v-if="step.time !== 0"><i class="fas fa-user-clock"></i>
              {{ step.time }} {{ _('min') }}</small>
          </h5>
        </div>
      </div>


      <div class="row">

        <div class="col col-md-4">
          <table class="table table-sm">
            <!-- eslint-disable vue/no-v-for-template-key-on-child -->
            <template v-for="i in step.ingredients">
              <Ingredient v-bind:ingredient="i" v-bind:servings="servings" :key="i.id"></Ingredient>
            </template>
            <!-- eslint-enable vue/no-v-for-template-key-on-child -->
          </table>
        </div>

        <div class="col col-md-8">
          <compile-component :code="step.ingredients_markdown" :servings="servings"></compile-component>
        </div>
      </div>
    </template>
    <template v-if="step.type === 'TIME'">
      <div class="row">
        <div class="col col-md-12" style="text-align: center">
          <h4 class="text-primary">
            <template v-if="step.name">{{ step.name }}</template>
            <template v-else>{{ _('Step') }} {{ index + 1 }}</template>
          </h4>
           <span style="margin-left: 4px" class="text-muted" v-if="step.time !== 0"><i class="fa fa-stopwatch"></i>
              {{ step.time }} {{ _('min') }}</span>
        </div>
      </div>
      <div class="row" v-if="step.instruction !== ''">
        <div class="col col-md-12" style="text-align: center">
          <compile-component :code="step.ingredients_markdown" :servings="servings"></compile-component>
        </div>

      </div>

    </template>


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
