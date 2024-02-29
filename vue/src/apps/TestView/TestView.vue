<template>

    <div id="app">
        <div>

            <div class="swipe-container">
                <div class="swipe-action bg-success">
                    <i class="swipe-icon fa-fw fas fa-check"></i>
                </div>

                <b-button-group class="swipe-element">

                    <div class="card flex-grow-1 btn-block p-2">
                        <div class="d-flex">
                            <div class="d-flex flex-column pr-2">
                            <span>
                            <span><i class="fas fa-check"></i> <b>100 g </b></span>
                            <br/>
                            </span>
                                <span>
                            <span><i class="fas fa-check"></i> <b>200 kg </b></span>
                            <br/>
                            </span>

                            </div>
                            <div class="d-flex  flex-column flex-grow-1 align-self-center">
                                Erdbeeren <br/>
                                <span><small class="text-muted">vabene111</small></span>
                            </div>
                        </div>


                    </div>
                    <b-button variant="success">
                        <i class="d-print-none fa-fw fas fa-check"></i>
                    </b-button>
                </b-button-group>
                <div class="swipe-action bg-primary justify-content-end">
                    <i class="fa-fw fas fa-hourglass-half swipe-icon"></i>
                </div>


            </div>


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
.swipe-container {
    display: flex;
    overflow: auto;
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
}

/* scrollbar should be hidden */
.swipe-container::-webkit-scrollbar {
    display: none;
}

.swipe-container {
    scrollbar-width: none; /* For Firefox */
}

/* main element should always snap into view */
.swipe-element {
    scroll-snap-align: start;
}

.swipe-icon {
    color: white;
    position: sticky;
    left: 16px;
    right: 16px;
}

/* swipe-actions and element should be 100% wide */
.swipe-action,
.swipe-element {
    min-width: 100%;
}

.swipe-action {
    display: flex;
    align-items: center;
}

.right {
    justify-content: flex-end;
}
</style>
