<template>
    <div class="rating">
        <span class="d-inline" v-if="recipe.rating > 0">
            <div v-if="!pill">
                <i class="fas fa-star fa-xs text-primary" v-for="i in Math.floor(recipe.rating)" v-bind:key="i"></i>
                <i class="fas fa-star-half-alt fa-xs text-primary" v-if="recipe.rating % 1 > 0"></i>
                <i class="far fa-star fa-xs text-secondary" v-for="i in 5 - Math.ceil(recipe.rating)" v-bind:key="i + 10"></i>
            </div>
            <div v-else>
                <b-badge pill variant="light" class="mt-1 font-weight-normal">
                    <i class="fas fa-star fa-xs text-dark" v-for="i in Math.floor(recipe.rating)" v-bind:key="i"></i>
                    <i class="fas fa-star-half-alt fa-xs text-dark" v-if="recipe.rating % 1 > 0"></i>
                    <i class="far fa-star fa-xs text-dark" v-for="i in 5 - Math.ceil(recipe.rating)" v-bind:key="i + 10"></i>
                </b-badge>
            </div>
        </span>
    </div>
</template>

<script>
export default {
    name: "RecipeRating",
    props: {
        recipe: Object,
        pill: { required: false, type: Boolean, default: false },
    },
}
</script>

<style scoped></style>
