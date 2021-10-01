<template>
  <div v-hover class="card cv-item meal-plan-card p-0" :key="value.id" :draggable="true"
       :style="`top:${top};height:${item_height}`"
       @dragstart="onDragItemStart(value, $event)"
       @click="onClickItem(value, $event)"
       :aria-grabbed="value == currentDragItem"
       :class="value.classes" :title="title"
       @contextmenu.prevent="$emit('open-context-menu', $event, value)">
    <div class="card-header p-1 text-center text-primary border-bottom-0" v-if="detailed"
         :style="`background-color: ${background_color}`">
      <span class="font-light text-center" v-if="entry.entry.meal_type.icon != null">{{
          entry.entry.meal_type.icon
        }}</span>
      <span class="font-light">{{ entry.entry.meal_type.name }}</span>
    </div>
    <div class="card-img-overlay h-100 d-flex flex-column justify-content-right float-right text-right p-0"
         v-if="detailed">
      <a>
        <div style="position: static;">
          <div class="dropdown b-dropdown position-static btn-group">
            <button aria-haspopup="true" aria-expanded="false" type="button"
                    class="btn dropdown-toggle btn-link text-decoration-none text-body pr-1 dropdown-toggle-no-caret"
                    @click.stop="$emit('open-context-menu', $event, value)"><i class="fas fa-ellipsis-v fa-lg"></i>
            </button>
          </div>
        </div>

      </a>
    </div>
    <div class="card-header p-1 text-center" v-if="detailed" :style="`background-color: ${background_color}`">
      <span class="font-light">{{ title }}</span>
    </div>
    <b-img fluid class="card-img-bottom" :src="entry.entry.recipe.image" v-if="hasRecipe && detailed"></b-img>
    <b-img fluid class="card-img-bottom" :src="image_placeholder" v-if="detailed && ((!hasRecipe && entry.entry.note === '') || (hasRecipe && entry.entry.recipe.image === null))"></b-img>
    <div class="card-body p-1" v-if="detailed && entry.entry.recipe == null"
         :style="`background-color: ${background_color}`">
      <p>{{ entry.entry.note }}</p>
    </div>
    <div class="row p-1 flex-nowrap" v-if="!detailed" :style="`background-color: ${background_color}`">
      <div class="col-2">
        <span class="font-light text-center" v-if="entry.entry.meal_type.icon != null">{{
            entry.entry.meal_type.icon
          }}</span>
        <span class="font-light text-center" v-if="entry.entry.meal_type.icon == null">❓</span>
      </div>
      <div class="col-10 d-inline-block text-truncate" :style="`max-height:${item_height}`">
        <span class="font-light">{{ title }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MealPlanCard.vue",
  components: {},
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
      currentDragItem: null,
      image_placeholder: window.IMAGE_PLACEHOLDER
    }
  },
  computed: {
    entry: function () {
      return this.value.originalItem
    },
    title: function () {
      if (this.entry.entry.title != null && this.entry.entry.title !== '') {
        return this.entry.entry.title
      } else {
        return this.entry.entry.recipe_name
      }
    },
    hasRecipe: function () {
      return this.entry.entry.recipe != null;
    },
    background_color: function () {
      if (this.entry.entry.meal_type.color != null && this.entry.entry.meal_type.color !== '') {
        return this.entry.entry.meal_type.color
      } else {
        return "#fff"
      }
    },
  },
  methods: {
    onDragItemStart(calendarItem, windowEvent) {
      windowEvent.dataTransfer.setData("text", calendarItem.id.toString())
      this.$emit("dragstart", calendarItem, windowEvent)
      return true
    },
    onContextMenuOpen(calendarItem, windowEvent) {
      windowEvent.dataTransfer.setData("text", calendarItem.id.toString())
      this.$emit("dragstart", calendarItem, windowEvent)
      return true
    },
    onClickItem(calendarItem, windowEvent) {
      this.$emit("click-item", calendarItem)
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