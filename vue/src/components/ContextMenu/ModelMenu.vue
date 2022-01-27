<template>
    <!-- <b-button variant="link" size="sm" class="text-dark shadow-none"><i class="fas fa-chevron-down"></i></b-button> -->
    <span>
        <b-dropdown variant="link" toggle-class="text-decoration-none text-dark shadow-none" no-caret style="boundary: window">
            <template #button-content>
                <i class="fas fa-chevron-down"></i>
            </template>
            <b-dropdown-item :href="resolveDjangoUrl('list_food')"> <i class="fas fa-leaf fa-fw"></i> {{ $t(Models["FOOD"].name) }} </b-dropdown-item>

            <b-dropdown-item :href="resolveDjangoUrl('list_keyword')"> <i class="fas fa-tags fa-fw"></i> {{ $t(Models["KEYWORD"].name) }} </b-dropdown-item>

            <b-dropdown-item :href="resolveDjangoUrl('list_unit')"> <i class="fas fa-balance-scale fa-fw"></i> {{ $t(Models["UNIT"].name) }} </b-dropdown-item>

            <b-dropdown-item :href="resolveDjangoUrl('list_supermarket')"> <i class="fas fa-store-alt fa-fw"></i> {{ $t(Models["SUPERMARKET"].name) }} </b-dropdown-item>

            <b-dropdown-item :href="resolveDjangoUrl('list_supermarket_category')"> <i class="fas fa-cubes fa-fw"></i> {{ $t(Models["SHOPPING_CATEGORY"].name) }} </b-dropdown-item>

            <b-dropdown-item :href="resolveDjangoUrl('list_automation')"> <i class="fas fa-robot fa-fw"></i> {{ $t(Models["AUTOMATION"].name) }} </b-dropdown-item>

            <b-dropdown-item :href="resolveDjangoUrl('list_user_file')"> <i class="fas fa-file fa-fw"></i> {{ $t(Models["USERFILE"].name) }} </b-dropdown-item>

            <b-dropdown-item :href="resolveDjangoUrl('list_step')"> <i class="fas fa-puzzle-piece fa-fw"></i>{{ $t(Models["STEP"].name) }} </b-dropdown-item>

            <b-dropdown-item :href="resolveDjangoUrl('list_custom_filter')"> <i class="fas fa-filter fa-fw"></i>{{ $t(Models["CUSTOM_FILTER"].name) }} </b-dropdown-item>
        </b-dropdown>
    </span>
</template>

<script>
import Vue from "vue"
import { BootstrapVue } from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"

import { Models } from "@/utils/models"
import { ResolveUrlMixin } from "@/utils/utils"

Vue.use(BootstrapVue)

export default {
    name: "ModelMenu",
    mixins: [ResolveUrlMixin],
    data() {
        return {
            Models: Models,
        }
    },
    mounted() {},
    methods: {
        gotoURL: function (model) {
            return
        },
    },
}
</script>
