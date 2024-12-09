<template>
  <div>
    <h2>Your Wishlist</h2>
    <ul v-if="wishlist.length">
      <li v-for="recipe in wishlist" :key="recipe.id">
        <recipe-card :recipe="recipe"></recipe-card>
        
        <p>{{ recipe.name }}</p>
      </li>
    </ul>
    <div v-else>Your wishlist is empty</div>
  </div>
</template>

<script>
import axios from "axios"
import { ApiApiFactory } from "@/utils/openapi/api.ts"
import RecipeCard from "@/components/RecipeCard.vue"

export default {
  components: {
    RecipeCard,
  },
  data() {
    return {
      wishlist: [], // Initialize wishlist array
    }
  },
  methods: {
    fetchWishlist() {
      let apiClient = ApiApiFactory()

      apiClient
        .listWishlists()
        .then((response) => {
          this.wishlist = response.data // Assign the fetched data to wishlist
        })
        .catch((error) => {
          console.error("Error fetching wishlist:", error)
        })
    }
  },
  created() {
    this.fetchWishlist() // Fetch the wishlist when the component is created
  },
}
</script>

<style scoped></style>
