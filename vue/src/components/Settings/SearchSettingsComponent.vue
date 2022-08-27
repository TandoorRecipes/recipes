<template>
    <div>


    <a :href="resolveDjangoUrl('view_shopping_settings')" class="btn btn-primary">Search Settings</a>
    <div v-if="false">
        <!--TODO search must fundamentally be reworked, thus i was to lazy to implement the settings -->

        method

        unpercice

        accent

        partial
        start with
        fuzzy
        full text
        trigram

    </div>

    </div>

</template>

<script>
import {ApiApiFactory} from "@/utils/openapi/api";
import {ResolveUrlMixin, StandardToasts} from "@/utils/utils";

import axios from "axios";

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

export default {
    name: "SearchSettingsComponent",
    mixins: [ResolveUrlMixin],
    props: {
        user_id: Number,
    },
    data() {
        return {

        }
    },
    mounted() {

    },
    methods: {

    }
}
</script>

<style scoped>

</style>