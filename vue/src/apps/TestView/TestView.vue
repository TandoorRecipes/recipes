<template>

    <div id="app">
        <div>



            <b-button-group class="w-100 mb-1" >
                <b-button variant="dark" block class="btn btn-block btn-sm text-left " >100 g Möhren Test <br/><small class="text-muted">Info</small></b-button>
                <b-button variant="success"><i class="fas fa-check"></i></b-button>
            </b-button-group>
            <br/>
            <b-button-group class="w-100">
                <b-button variant="dark" block class="btn btn-block text-left" >150 ml Heißwassermöhrenbrühe<br/><small class="text-muted">Info</small></b-button>
                <b-button variant="success"><i class="fas fa-check"></i></b-button>
            </b-button-group>

            <br/>
            <br/>
            <br/>
            ----

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
