<template>

  <div>
    <div class="card border-success">

      <div class="card-body">
        <div class="row">
          <div class="col-12">
            <h5><i class="fas fa-carrot"></i> {{ _('Nutrition') }}</h5>
          </div>
        </div>


        <div class="row">
          <div class="col-12">
            {{ _('Calories') }}
            {{ calculateAmount(recipe.nutrition.calories) }} kcal
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            {{ _('Carbohydrates') }}
            {{ calculateAmount(recipe.nutrition.carbohydrates) }} g
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            {{ _('Fats') }}
            {{ calculateAmount(recipe.nutrition.fats) }} g
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            {{ _('Proteins') }}
            {{ calculateAmount(recipe.nutrition.proteins) }} g
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
    servings: Number,
  },
  methods: {
    calculateAmount: function (x) {
      return calculateAmount(x, this.servings)
    }
  }
}
</script>
