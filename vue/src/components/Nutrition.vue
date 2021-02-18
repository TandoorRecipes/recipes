<template>

  <div v-if="recipe.nutrition !== null">
    <div class="card border-success">

      <div class="card-body">
        <div class="row">
          <div class="col-12">
            <h4 class="card-title"><i class="fas fa-carrot"></i> {{ _('Nutrition') }}</h4>
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <i class="fas fa-fire fa-fw text-primary"></i> {{ _('Calories') }}
          </div>
          <div class="col-6">
            <span v-html="calculateAmount(recipe.nutrition.calories)"></span> kcal
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <i class="fas fa-bread-slice fa-fw text-primary"></i> {{ _('Carbohydrates') }}
          </div>
          <div class="col-6">
            <span v-html="calculateAmount(recipe.nutrition.carbohydrates)"></span>  g
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <i class="fas fa-cheese fa-fw text-primary"></i> {{ _('Fats') }}
          </div>
          <div class="col-6">
            <span v-html="calculateAmount(recipe.nutrition.fats)"></span> g
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <i class="fas fa-drumstick-bite fa-fw text-primary"></i> {{ _('Proteins') }}
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

import {GettextMixin} from "@/utils/utils";
import {calculateAmount} from "@/utils/utils";

export default {
  name: 'Nutrition',
  mixins: [
    GettextMixin,
  ],
  props: {
    recipe: Object,
    ingredient_factor: Number,
  },
  methods: {
    calculateAmount: function (x) {
      return calculateAmount(x, this.ingredient_factor)
    }
  }
}
</script>
