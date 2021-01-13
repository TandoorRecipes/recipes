<template>
    <tr @click="$emit('checked-state-changed', ingredient)">
      <td>
        <i class="far fa-check-circle text-success" v-if="ingredient.checked"></i>
        <i class="far fa-check-circle text-primary" v-if="!ingredient.checked"></i>
      </td>
      <td>
        <span v-if="ingredient.amount !== 0">{{ calculateAmount(ingredient.amount) }}</span>
      </td>
      <td>
        <span v-if="ingredient.unit !== null">{{ ingredient.unit.name }}</span>
      </td>
      <td>
        <span v-if="ingredient.food !== null">{{ ingredient.food.name }}</span>
      </td>
      <td>
        <div v-if="ingredient.note">
          <span v-b-popover.hover="ingredient.note"
                    class="d-print-none"> <i class="far fa-comment"></i>
          </span>

          <div class="d-none d-print-block">
            <i class="far fa-comment-alt"></i> {{ ingredient.note }}
          </div>
        </div>
      </td>
    </tr>
</template>

<script>

import {calculateAmount} from "@/utils/utils";

export default {
  name: 'Ingredient',
  props: {
    ingredient: Object,
    ingredient_factor: {
      type: Number,
      default: 1,
    }
  },
  data() {
    return {
      checked: false
    }
  },
  methods: {
    calculateAmount: function (x) {
      return calculateAmount(x, this.ingredient_factor)
    }
  }
}
</script>
