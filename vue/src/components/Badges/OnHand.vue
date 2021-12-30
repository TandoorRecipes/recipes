<template>
    <span>
        <b-button
            class="btn text-decoration-none fas px-1 py-0 border-0"
            variant="link"
            v-b-popover.hover.html
            :title="[onhand ? $t('FoodOnHand', { food: item.name }) : $t('FoodNotOnHand', { food: item.name })]"
            :class="[onhand ? 'text-success fa-clipboard-check' : 'text-muted fa-clipboard']"
            @click="toggleOnHand"
        />
    </span>
</template>

<script>
import { ApiMixin } from "@/utils/utils"

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
