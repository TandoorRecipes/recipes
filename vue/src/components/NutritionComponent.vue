<template>

  <div v-if="recipe.nutrition !== null">
    <div class="card border-success">

      <div class="card-body">
        <div class="row">
          <div class="col-12">
            <h4 class="card-title"><i class="fas fa-carrot"></i> {{ $t('Nutrition') }}</h4>
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <i class="fas fa-fire fa-fw text-primary"></i> {{ $t(energy()) }}
          </div>
          <div class="col-6">
            <span v-html="calculateEnergy(recipe.nutrition.calories)"></span>
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <i class="fas fa-bread-slice fa-fw text-primary"></i> {{ $t('Carbohydrates') }}
          </div>
          <div class="col-6">
            <span v-html="calculateAmount(recipe.nutrition.carbohydrates)"></span>  g
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <i class="fas fa-cheese fa-fw text-primary"></i> {{ $t('Fats') }}
          </div>
          <div class="col-6">
            <span v-html="calculateAmount(recipe.nutrition.fats)"></span> g
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <i class="fas fa-drumstick-bite fa-fw text-primary"></i> {{ $t('Proteins') }}
          </div>
          <div class="col-6">
            <span v-html="calculateAmount(recipe.nutrition.proteins)"></span> g
          </div>
        </div>
      </div>

      </div>
    </div>

</template>

<script>

import {calculateAmount, calculateEnergy, energyHeading} from "@/utils/utils";
import Vue from "vue"
import VueSanitize from "vue-sanitize";
Vue.use(VueSanitize);


export default {
  name: 'NutritionComponent',
  props: {
    recipe: Object,
    ingredient_factor: Number,
  },
  methods: {
    calculateAmount: function (x) {
      return this.$sanitize(calculateAmount(x, this.ingredient_factor))
    },
    calculateEnergy: function (x) {
      return this.$sanitize(calculateEnergy(x, this.ingredient_factor))
    },
    energy: function (x) {
      return this.$sanitize(energyHeading())
    }
  }
}
</script>
