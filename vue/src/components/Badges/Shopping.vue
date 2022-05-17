<template>
    <span v-if="!item.ignore_shopping">
        <b-button class="btn text-decoration-none px-1 border-0" variant="link" :id="`shopping${item.id}`" @click="addShopping()">
            <i
                class="fas"
                v-b-popover.hover.html
                :title="[shopping ? $t('RemoveFoodFromShopping', { food: $sanitize(item.name) }) : $t('AddFoodToShopping', { food: $sanitize(item.name) })]"
                :class="[shopping ? 'text-success fa-shopping-cart' : 'text-muted fa-cart-plus']"
            />
        </b-button>
        <b-popover v-if="shopping" :target="`${ShowConfirmation}`" :ref="'shopping' + item.id" triggers="focus" placement="top">
            <template #title>{{ DeleteConfirmation }}</template>
            <b-row align-h="end">
                <b-col cols="auto">
                    <b-button class="btn btn-sm btn-info shadow-none px-1 border-0" @click="cancelDelete()">{{ $t("Cancel") }}</b-button>
                    <b-button class="btn btn-sm btn-danger shadow-none px-1" @click="confirmDelete()">{{ $t("Confirm") }}</b-button>
                </b-col>
            </b-row>
        </b-popover>
    </span>
</template>

<script>
import { ApiMixin, StandardToasts } from "@/utils/utils"
import Vue from "vue"
import VueSanitize from "vue-sanitize";
Vue.use(VueSanitize);

export default {
    name: "ShoppingBadge",
    props: {
        item: { type: Object },
    },
    mixins: [ApiMixin],
    data() {
        return {
            shopping: false,
        }
    },
    mounted() {
        // let random = [true, false,]
        this.shopping = this.item?.shopping //?? random[Math.floor(Math.random() * random.length)]
    },
    computed: {
        DeleteConfirmation() {
            return this.$t("DeleteShoppingConfirm", { food: this.item.name })
        },
        ShowConfirmation() {
            if (this.shopping) {
                return "shopping" + this.item.id
            } else {
                return ""
            }
        },
    },
    watch: {
        "item.shopping": function (newVal, oldVal) {
            this.shopping = newVal
        },
    },
    methods: {
        addShopping() {
            if (this.shopping) {
                return
            } // if item already in shopping list, execution handled after confirmation
            let params = {
                id: this.item.id,
                amount: 1,
            }
            this.genericAPI(this.Models.FOOD, this.Actions.SHOPPING, params).then((result) => {
                this.shopping = true
                StandardToasts.makeStandardToast(this,StandardToasts.SUCCESS_CREATE)
            })
        },
        cancelDelete() {
            this.$refs["shopping" + this.item.id].$emit("close")
        },
        confirmDelete() {
            let params = {
                id: this.item.id,
                _delete: "true",
            }
            this.genericAPI(this.Models.FOOD, this.Actions.SHOPPING, params).then(() => {
                this.shopping = false
                this.$refs["shopping" + this.item.id].$emit("close")
                StandardToasts.makeStandardToast(this,StandardToasts.SUCCESS_DELETE)
            })
        },
    },
}
</script>
