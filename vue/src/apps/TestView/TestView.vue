<template>

    <div id="app">
        <div>
            <markdown-editor-component></markdown-editor-component>

        </div>
    </div>
</template>


<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"
import {ApiMixin, resolveDjangoUrl, StandardToasts} from "@/utils/utils";
import axios from "axios";
import BetaWarning from "@/components/BetaWarning.vue";
import {ApiApiFactory} from "@/utils/openapi/api";
import GenericMultiselect from "@/components/GenericMultiselect.vue";
import GenericModalForm from "@/components/Modals/GenericModalForm.vue";
import {Models} from "@/utils/models";
import MarkdownEditorComponent from "@/components/MarkdownEditorComponent.vue";


Vue.use(BootstrapVue)


export default {
    name: "TestView",
    mixins: [ApiMixin],
    components: {MarkdownEditorComponent},
    computed: {},
    data() {
        return {}
    },
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE


    },
    methods: {
        refreshData: function () {

        }
    },
}
</script>

<style>

</style>
