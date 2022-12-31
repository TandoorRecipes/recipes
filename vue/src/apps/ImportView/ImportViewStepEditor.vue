<template>
  <div v-if="recipe_json !== undefined" class="mt-2 mt-md-0">
    <h5>Steps</h5>
    <div class="row">
      <div class="col col-md-12 text-center">
        <b-button @click="autoSortIngredients()" variant="secondary" v-b-tooltip.hover v-if="recipe_json.steps.length > 1"
                  :title="$t('Auto_Sort_Help')"><i class="fas fa-random"></i> {{ $t('Auto_Sort') }}
        </b-button>
        <b-button @click="splitAllSteps('\n')" variant="secondary" class="ml-1" v-b-tooltip.hover
                  :title="$t('Split_All_Steps')"><i
            class="fas fa-expand-arrows-alt"></i> {{ $t('All') }}
        </b-button>
        <b-button @click="mergeAllSteps()" variant="primary" class="ml-1" v-b-tooltip.hover
                  :title="$t('Combine_All_Steps')"><i
            class="fas fa-compress-arrows-alt"></i> {{ $t('All') }}
        </b-button>
      </div>
    </div>
    <div class="row mt-2" v-for="(s, index) in recipe_json.steps"
         v-bind:key="index">
      <div class="col col-md-4 d-none d-md-block">
        <draggable :list="s.ingredients" group="ingredients"
                   :empty-insert-threshold="10">
          <b-list-group-item v-for="i in s.ingredients"
                             v-bind:key="i.original_text"><i
              class="fas fa-arrows-alt"></i> {{ i.original_text }}
          </b-list-group-item>
        </draggable>
      </div>
      <div class="col col-md-8 col-12">
        <b-input-group>
          <b-textarea
              style="white-space: pre-wrap" v-model="s.instruction"
              max-rows="10"></b-textarea>
          <b-input-group-append>
            <b-button variant="secondary" @click="splitStep(s,'\n')"><i
                class="fas fa-expand-arrows-alt"></i></b-button>
            <b-button variant="danger"
                      @click="recipe_json.steps.splice(recipe_json.steps.findIndex(x => x === s),1)">
              <i class="fas fa-trash-alt"></i>
            </b-button>

          </b-input-group-append>
        </b-input-group>

        <div class="text-center mt-1">
          <b-button @click="mergeStep(s)" variant="primary"
                    v-if="index + 1 < recipe_json.steps.length"><i
              class="fas fa-compress-arrows-alt"></i>
          </b-button>

          <b-button variant="success"
                    @click="recipe_json.steps.splice(recipe_json.steps.findIndex(x => x === s) +1,0,{ingredients:[], instruction: ''})">
            <i class="fas fa-plus"></i>
          </b-button>

        </div>
      </div>
    </div>
  </div>
</template>

<script>


import draggable from "vuedraggable";
import stringSimilarity from "string-similarity"

export default {
  name: "ImportViewStepEditor",
  components: {
    draggable
  },
  props: {
    recipe: undefined
  },
  data() {
    return {
      recipe_json: undefined
    }
  },
  watch: {
    recipe_json: function () {
      this.$emit('change', this.recipe_json)
    },
  },
  mounted() {
    this.recipe_json = this.recipe
  },
  methods: {
    /**
     * utility function used by splitAllSteps and splitStep to split a single step object into multiple step objects
     * @param step: single step
     * @param split_character: character to split steps at
     * @return array of step objects
     */
    splitStepObject: function (step, split_character) {
      let steps = []
      step.instruction.split(split_character).forEach(part => {
        if (part.trim() !== '') {
          steps.push({'instruction': part, 'ingredients': []})
        }
      })
      steps[0].ingredients = step.ingredients // put all ingredients from the original step in the ingredients of the first step of the split step list
      return steps
    },
    /**
     * Splits all steps of a given recipe_json at the split character (e.g. \n or \n\n)
     * @param split_character: character to split steps at
     */
    splitAllSteps: function (split_character) {
      let steps = []
      this.recipe_json.steps.forEach(step => {
        steps = steps.concat(this.splitStepObject(step, split_character))
      })
      this.recipe_json.steps = steps
    },
    /**
     * Splits the given step at the split character (e.g. \n or \n\n)
     * @param step: step ingredients to split
     * @param split_character: character to split steps at
     */
    splitStep: function (step, split_character) {
      let old_index = this.recipe_json.steps.findIndex(x => x === step)
      let new_steps = this.splitStepObject(step, split_character)
      this.recipe_json.steps.splice(old_index, 1, ...new_steps)
    },
    /**
     * Merge all steps of a given recipe_json into one
     */
    mergeAllSteps: function () {
      let step = {'instruction': '', 'ingredients': []}
      this.recipe_json.steps.forEach(s => {
        step.instruction += s.instruction + '\n'
        step.ingredients = step.ingredients.concat(s.ingredients)
      })
      this.recipe_json.steps = [step]
    },
    /**
     * Merge two steps (the given and next one)
     */
    mergeStep: function (step) {
      let step_index = this.recipe_json.steps.findIndex(x => x === step)
      let removed_steps = this.recipe_json.steps.splice(step_index, 2)

      this.recipe_json.steps.splice(step_index, 0, {
        'instruction': removed_steps.flatMap(x => x.instruction).join('\n'),
        'ingredients': removed_steps.flatMap(x => x.ingredients)
      })
    },
    /**
     * automatically assign ingredients to steps based on text matching
     */
    autoSortIngredients: function () {
      let ingredients = this.recipe_json.steps.flatMap(s => s.ingredients)
      this.recipe_json.steps.forEach(s => s.ingredients = [])

      ingredients.forEach(i => {
        let found = false
        this.recipe_json.steps.forEach(s => {
          if (s.instruction.includes(i.food.name.trim()) && !found) {
            found = true
            s.ingredients.push(i)
          }
        })
        if (!found) {
          let best_match = {rating: 0, step: this.recipe_json.steps[0]}
          this.recipe_json.steps.forEach(s => {
            let match = stringSimilarity.findBestMatch(i.food.name.trim(), s.instruction.split(' '))
            if (match.bestMatch.rating > best_match.rating) {
              best_match = {rating: match.bestMatch.rating, step: s}
            }
          })
          best_match.step.ingredients.push(i)
          found = true
        }
      })
    }
  }
}
</script>

<style scoped>

</style>