<template>
    <span><i class="mx-1 far fa-question-circle text-muted" @click="this_help.show = !this_help.show" /></span>
</template>

<script>
import Vue from "vue"
import VueCookies from "vue-cookies"
Vue.use(VueCookies)
let HELP_COOKIE_NAME = "help_settings"

export default {
    name: "HelpBadge",
    props: {
        component: { type: String, required: true },
    },
    data() {
        return {
            help: {},

            default: {
                show: true,
            },
            this_help: undefined,
        }
    },
    mounted() {
        this.$nextTick(function () {
            if (this.$cookies.isKey(HELP_COOKIE_NAME)) {
                this.help = Object.assign({}, this.help, this.$cookies.get(HELP_COOKIE_NAME))
            }
            this.this_help = Object.assign({}, this.default, this.help?.[this.component])
        })
    },
    watch: {
        help: {
            handler() {
                this.$cookies.set(HELP_COOKIE_NAME, this.help)
            },
            deep: true,
        },
        this_help: {
            handler() {
                this.help[this.component] = Object.assign({}, this.this_help)
                this.$cookies.set(HELP_COOKIE_NAME, this.help)
            },
            deep: true,
        },
        "this_help.show": function () {
            if (this.this_help.show) {
                this.$emit("show")
            } else {
                this.$emit("hide")
            }
        },
    },
    methods: {},
}
</script>
