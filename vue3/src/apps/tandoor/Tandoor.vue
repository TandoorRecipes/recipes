<template>
    <v-app>
        <v-app-bar color="primary" >
            <template v-slot:prepend>
                <v-app-bar-nav-icon></v-app-bar-nav-icon>
            </template>

            <v-app-bar-title><v-img src="../../assets/brand_logo.svg"></v-img></v-app-bar-title>
        </v-app-bar>

        <v-main>
            <router-view></router-view>
        </v-main>

        <v-bottom-navigation>
            <v-btn value="recent" to="/">
                <v-icon>mdi-history</v-icon>

                <span>Recipes</span>
            </v-btn>

            <v-btn value="favorites" to="/about">
                <v-icon>mdi-shopping</v-icon>

                <span>Shopping</span>
            </v-btn>

            <v-btn value="nearby">
                <v-icon>mdi-book</v-icon>

                <span>Books</span>
            </v-btn>
        </v-bottom-navigation>
    </v-app>


</template>

<script lang="ts">

import {defineComponent} from 'vue'

export default defineComponent({
    components: {},
    mixins: [],
    data() {
        return {}
    },
    mounted() {

    },
    methods: {},
})

</script>

<style scoped>


</style>
