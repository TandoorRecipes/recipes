<template>
    <span>
        <b-button v-if="!item.ignore_shopping" class="btn text-decoration-none fas px-1 py-0 border-0" variant="link" v-b-popover.hover.html :title="$sanitize(Title)" :class="IconClass" @click="toggleOnHand" />
    </span>
</template>

<script>
import { ApiMixin } from "@/utils/utils"
import Vue from "vue"
import VueSanitize from "vue-sanitize";
Vue.use(VueSanitize);


export default {
    name: "OnHandBadge",
    props: {
        item: { type: Object },
    },
    mixins: [ApiMixin],
    data() {
        return {
            onhand: false,
        }
    },
    computed: {
        Title: function () {
            if (this.onhand) {
                return this.$t("FoodOnHand", { food: this.item.name })
            } else if (this.item.substitute_onhand) {
                return this.$t("SubstituteOnHand")
            } else {
                return this.$t("FoodNotOnHand", { food: this.item.name })
            }
        },
        IconClass: function () {
            if (this.onhand) {
                return "text-success fa-clipboard-check"
            } else if (this.item.substitute_onhand) {
                return "text-warning fa-clipboard-check"
            } else {
                return "text-muted fa-clipboard"
            }
        },
    },
    mounted() {
        this.onhand = this.item.food_onhand
    },
    watch: {
        "item.food_onhand": function (newVal, oldVal) {
            this.onhand = newVal
        },
    },
    methods: {
        toggleOnHand() {
            let params = { id: this.item.id, food_onhand: !this.onhand }
            this.genericAPI(this.Models.FOOD, this.Actions.UPDATE, params).then(() => {
                this.onhand = !this.onhand
            })
        },
    },
}
</script>
