<template>
  <div v-hover class="card cv-item meal-plan-card p-0" :key="value.id" :draggable="true"
       :style="`top:${top};height:${item_height}`"
       @dragstart="onDragItemStart(value, $event)"
       @click.stop="onClickItem(value, $event)"
       :aria-grabbed="value == currentDragItem"
       :class="value.classes" :title="title">
    <div class="card-header p-1 text-center text-primary border-bottom-0" v-if="detailed">
      <span class="font-light">{{ entry.entry.meal_type_name }}</span>
    </div>
    <div class="card-img-overlay h-100 d-flex flex-column justify-content-right float-right text-right p-0"
         v-if="detailed">
      <a>
        <meal-plan-card-context-menu :entry="entry.entry" @move-left="$emit('move-left')"
                                     @move-right="$emit('move-right')"></meal-plan-card-context-menu>
      </a>
    </div>
    <div class="card-header p-1 text-center" v-if="detailed">
      <span class="font-light">{{ title }}</span>
    </div>
    <b-img fluid class="card-img-bottom" :src="entry.entry.recipe.image" v-if="isRecipe && detailed"></b-img>
    <div class="card-body p-1" v-if="!isRecipe && detailed">
      {{ entry.entry.note }}
    </div>
    <div class="row p-1 flex-nowrap" v-if="!detailed">
      <div class="col-2">
        <span class="font-light text-center">🍔</span>
      </div>
      <div class="col-10 d-inline-block text-truncate" :style="`max-height:${item_height}`">
        <span class="font-light">{{ title }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import MealPlanCardContextMenu from "./MealPlanCardContextMenu";

export default {
  name: "MealPlanCard.vue",
  components: {MealPlanCardContextMenu},
  props: {
    value: Object,
    weekStartDate: Date,
    top: String,
    detailed: Boolean,
    item_height: String
  },
  data: function () {
    return {
      dateSelectionOrigin: null,
      currentDragItem: null
    }
  },
  computed: {
    entry: function () {
      return this.value.originalItem
    },
    title: function () {
      if (this.isRecipe) {
        return this.entry.entry.recipe_name
      } else {
        return this.entry.entry.title
      }
    },
    isRecipe: function () {
      return ('recipe_name' in this.entry.entry)
    },
  },
  methods: {
    onClickItem(calendarItem, windowEvent) {
      this.$root.$emit("click-item", calendarItem, windowEvent)
    },
    onDragItemStart(calendarItem, windowEvent) {
      windowEvent.dataTransfer.setData("text", calendarItem.id.toString())
      this.$root.$emit("dragUpdate", calendarItem, windowEvent)
      return true
    },
  },
  directives: {
    hover: {
      inserted: (el) => {
        el.addEventListener('mouseenter', () => {
          el.classList.add("shadow")
        });
        el.addEventListener('mouseleave', () => {
          el.classList.remove("shadow")
        });
      }
    }
  }
}
</script>

<style scoped>
.meal-plan-card {
  background-color: #fff;
}

.theme-default .cv-day.draghover {
  box-shadow: inset 0 0 0.2em 0.2em grey;
}
</style>