<template>
    <!-- bottom button nav -->
    <div class="fixed-bottom p-1 pt-2 border-top text-center d-md-none" style="background: white">
        <div class="d-flex flex-row justify-content-around">
            <div class="flex-column"><a class="nav-link bottom-nav-link p-0" v-bind:href="resolveDjangoUrl('view_search')">
                <i class="fas fa-fw fa-book " style="font-size: 1.5em"></i><br/><small>Recipes</small></a>
            </div>
            <div class="flex-column"><a class="nav-link bottom-nav-link p-0" v-bind:href="resolveDjangoUrl('view_plan')">
                <i class="fas fa-calendar-alt" style="font-size: 1.5em"></i><br/><small>Plans</small></a>
            </div>
            <div class="flex-column"><a class="nav-link bottom-nav-link p-0" v-bind:href="resolveDjangoUrl('new_recipe')">
                <i class="fas fa-plus-circle fa-2x"></i><br/></a>
            </div>
            <div class="flex-column"><a class="nav-link bottom-nav-link p-0" v-bind:href="resolveDjangoUrl('view_shopping')">
                <i class="fas fa-shopping-cart" style="font-size: 1.5em"></i><br/><small>Shopping</small></a>
            </div>
            <div class="flex-column"><a class="nav-link bottom-nav-link p-0" v-bind:href="resolveDjangoUrl('view_books')">
                <i class="fas fa-book-open" style="font-size: 1.5em"></i><br/><small>Books</small></a>
            </div>
        </div>

    </div>
</template>

<script>
import {ResolveUrlMixin} from "@/utils/utils";

export default {
    name: "BottomNavigationBar",
    mixins: [ResolveUrlMixin]
}
</script>

<style scoped>

.bottom-nav-link {
    color: #666666
}
</style>