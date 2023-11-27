<template>
    <div id="app">
        <br />

        <template v-if="export_info !== undefined">
            <template v-if="export_info.running">
                <h5 style="text-align: center">{{ $t("Exporting") }}...</h5>

                <b-progress :max="export_info.total_recipes">
                    <b-progress-bar :value="export_info.exported_recipes" :label="`${export_info.exported_recipes}/${export_info.total_recipes}`"></b-progress-bar>
                </b-progress>

                <loading-spinner :size="25"></loading-spinner>
            </template>

            <div class="row">
                <div class="col col-md-12" v-if="!export_info.running">
                    <span>{{ $t("Export_finished") }}! </span> <a :href="`${resolveDjangoUrl('viewExport')}`">{{ $t("Return to export") }} </a><br /><br />

                    {{ $t("If download did not start automatically: ") }}

                    <template v-if="false">
                    <!--template v-if="export_info.expired"  temporary disabling this to get around immediate expiration-->
                        <a disabled ref="downloadAnchor">
                            <del>{{ $t("Download") }}</del>
                        </a>
                        ({{ $t("Expired") }})
                    </template>
                    <a v-else :href="`${resolveDjangoUrl('view_export_file', export_id)}`" ref="downloadAnchor">{{ $t("Download") }}</a>

                    <br />
                    {{ $t("The link will remain active for") }}

                    <template v-if="export_info.cache_duration > 3600"> {{ export_info.cache_duration / 3600 }}{{ $t("hr") }} </template>
                    <template v-else-if="export_info.cache_duration > 60"> {{ export_info.cache_duration / 60 }}{{ $t("min") }} </template>
                    <template v-else> {{ export_info.cache_duration }}{{ $t("sec") }} </template>

                    <br />
                </div>
            </div>

            <br />

            <div class="row">
                <div class="col col-md-12">
                    <label for="id_textarea">{{ $t("Information") }}</label>
                    <textarea id="id_textarea" ref="output_text" class="form-control" style="height: 50vh" v-html="$sanitize(export_info.msg)" disabled></textarea>
                </div>
            </div>
            <br />
            <br />
        </template>
    </div>
</template>

<script>
import { BootstrapVue } from "bootstrap-vue"
import Vue from "vue"

import "bootstrap-vue/dist/bootstrap-vue.css"

import { ResolveUrlMixin, ToastMixin, makeToast } from "@/utils/utils"

import LoadingSpinner from "@/components/LoadingSpinner"

import { ApiApiFactory } from "@/utils/openapi/api.ts"
import VueSanitize from "vue-sanitize"

Vue.use(BootstrapVue)
Vue.use(VueSanitize)
export default {
    name: "ExportResponseView",
    mixins: [ResolveUrlMixin, ToastMixin],
    components: {
        LoadingSpinner,
    },
    data() {
        return {
            export_id: window.EXPORT_ID,
            export_info: undefined,
        }
    },
    mounted() {
        this.refreshData()
        this.$i18n.locale = window.CUSTOM_LOCALE

        this.dynamicIntervalTimeout = 250 //initial refresh rate
        this.run = setTimeout(this.dynamicInterval.bind(this), this.dynamicIntervalTimeout)
    },
    methods: {
        dynamicInterval: function () {
            //update frequently at start but slowdown as it takes longer
            this.dynamicIntervalTimeout = Math.round(this.dynamicIntervalTimeout * ((1 + Math.sqrt(5)) / 2))
            if (this.dynamicIntervalTimeout > 5000) this.dynamicIntervalTimeout = 5000
            clearInterval(this.run)
            this.run = setInterval(this.dynamicInterval.bind(this), this.dynamicIntervalTimeout)

            if (this.export_id !== null && window.navigator.onLine && this.export_info.running) {
                this.refreshData()
                let el = this.$refs.output_text
                el.scrollTop = el.scrollHeight

                if (this.export_info.expired) makeToast(this.$t("Error"), this.$t("The download link is expired!"), "danger")
            }
        },

        startDownload: function () {
            this.$refs["downloadAnchor"].click()
        },

        refreshData: function () {
            let apiClient = new ApiApiFactory()

            apiClient.retrieveExportLog(this.export_id).then((result) => {
                this.export_info = result.data
                this.export_info.expired = !this.export_info.possibly_not_expired

                if (!this.export_info.running)
                    this.$nextTick(() => {
                        this.startDownload()
                    })
            })
        },
    },
}
</script>

<style></style>
