<template>

    <div v-hover
         class="card cv-item meal-plan-card p-0"
         :key="value.id"
         :draggable="true"
         :style="{'top': top, 'height': item_height, 'border-color': entry.entry.meal_type.color}"
         @dragstart="onDragItemStart(value, $event)"
         @click="onClickItem(value, $event)"
         :aria-grabbed="value == currentDragItem"
         :class="value.classes"
         @contextmenu.prevent="$emit('open-context-menu', $event, value)">

        <div class="d-flex flex-row align-items-center">
            <div class="flex-column">
                <img class="" style="object-fit: cover" :style="{'height': item_height, 'width': item_height}" :src="entry.entry.recipe.image"
                     v-if="hasRecipe && detailed"/>
                <img class="" style="object-fit: cover" :style="{'height': item_height, 'width': item_height}" :src="image_placeholder"
                     v-if="detailed && ((!hasRecipe && entry.entry.note === '') || (hasRecipe && entry.entry.recipe.image === null))"/>
            </div>
            <div class="flex-column flex-grow-0 align-middle justify-content-center">
                <div class="card-body p-0 pl-1 align-middle">

                    <span class="font-light" :class="{'two-line-text': detailed,'one-line-text': !detailed,}">
                       <i class="fas fa-shopping-cart fa-xs float-left" v-b-tooltip.hover.top :title="$t('in_shopping')" v-if="entry.entry.shopping"/>
                        {{ title }}</span>
                </div>
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
        item_height: String,
    },
    data: function () {
        return {
            dateSelectionOrigin: null,
            currentDragItem: null,
            image_placeholder: window.IMAGE_PLACEHOLDER,
        }
    },
    mounted() {
    },
    computed: {
        entry: function () {
            return this.value.originalItem
        },
        title: function () {
            if (this.entry.entry.title != null && this.entry.entry.title !== "") {
                return this.entry.entry.title
            } else {
                return this.entry.entry.recipe_name
            }
        },
        hasRecipe: function () {
            return this.entry.entry.recipe != null
        },
        background_color: function () {
            if (this.entry.entry.meal_type.color != null && this.entry.entry.meal_type.color !== "") {
                return this.entry.entry.meal_type.color
            } else {
                return "#fff"
            }
        },
    },
    methods: {
        onDragItemStart(calendarItem, windowEvent) {
            this.$emit("dragstart", calendarItem, windowEvent)
            return true
        },
        onContextMenuOpen(calendarItem, windowEvent) {
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
                el.addEventListener("mouseenter", () => {
                    el.classList.add("shadow")
                })
                el.addEventListener("mouseleave", () => {
                    el.classList.remove("shadow")
                })
            },
        },
    },
}
</script>

<style scoped>
.meal-plan-card {
    background-color: #fff;
}

@media (max-width: 767.9px) {
    .meal-plan-card {
        font-size: 13px;
    }
}

.two-line-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}

.one-line-text {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
