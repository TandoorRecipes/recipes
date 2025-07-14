<template>
    <div>
        <div class="dropdown d-print-none">
            <a
                class="btn shadow-none p-0"
                href="javascript:void(0);"
                role="button"
                id="dropdownMenuLink"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                @click="clicked = true"
            >
                <i class="fas fa-exchange-alt fa-sm"></i>
            </a>

            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink">
                <!-- list of first 5 substitutes onhand -->
                <span v-if="item.substitute_onhand && substitutes.length !== 0">
                    <div class="dropdown-divider"></div>
                    <h5 class="dropdown-header">{{ $t("SubstitutesList") }}</h5>
                    <a class="dropdown-header mx-2 py-0" v-for="(s, i) in substitutes" v-bind:key="i">{{ s }}</a>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import { ApiMixin } from "@/utils/utils"
import Vue from "vue"

export default {
    name: "SubstituteBadge",
    props: {
        item: { type: Object },
    },
    mixins: [ApiMixin],
    data() {
        return {
            substitutes: [],
            clicked: false,
        }
    },
    computed: {},
    mounted() {},
    watch: {
        // only load shopping/substitute status if clicked
        clicked: function (newVal, oldVal) {
            if (newVal !== oldVal) {
                if (this.item.substitute_onhand) {
                    this.getSubstitutes()
                }
            }
        },
    },
    methods: {
        getSubstitutes() {
            let params = {
                id: this.item.id,
                options: { query: { onhand: true } },
            }
            this.genericAPI(this.Models.FOOD, this.Actions.SUBSTITUTES, params).then((result) => {
                this.substitutes = result.data.map((x) => x.name)
            })
        },
    },
}
</script>
