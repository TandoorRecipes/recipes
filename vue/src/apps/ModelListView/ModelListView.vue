<template>
    <div id="app" style="margin-bottom: 4vh" v-if="this_model">
        <generic-modal-form v-if="this_model" :model="this_model" :action="this_action" :item1="this_item"
                            :item2="this_target" :show="show_modal" @finish-action="finishAction"/>

        <div class="row">
            <div class="col-md-2 d-none d-md-block"></div>
            <div class="col-xl-8 col-12">
                <div class="container-fluid d-flex flex-column flex-grow-1">
                    <!-- dynamically loaded header components -->
                    <div class="row" v-if="header_component_name">
                        <div class="col-md-12">
                            <component :is="headerComponent"></component>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-9" style="margin-top: 1vh">
                            <h3>
                                <!-- <span><b-button variant="link" size="sm" class="text-dark shadow-none"><i class="fas fa-chevron-down"></i></b-button></span> -->
                                <model-menu/>
                                <span>{{ $t(this.this_model.name) }}</span>
                                <span v-if="apiName !== 'Step' && apiName !== 'CustomFilter'">
                                    <b-button variant="link" @click="startAction({ action: 'new' })">
                                        <i class="fas fa-plus-circle fa-2x"></i>
                                    </b-button> </span >
                                <!-- TODO add proper field to model config to determine if create should be available or not -->
                            </h3>
                        </div>
                        <div class="col-md-3" style="position: relative; margin-top: 1vh">
                            <b-form-checkbox v-model="show_split" name="check-button" v-if="paginated"
                                             class="shadow-none"
                                             style="position: relative; top: 50%; transform: translateY(-50%)" switch>
                                {{ $t("show_split_screen") }}
                            </b-form-checkbox>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col" :class="{ 'col-md-6': show_split }">
                            <!-- model isn't paginated and loads in one API call -->
                            <div v-if="!paginated">
                                <generic-horizontal-card v-for="i in items_left" v-bind:key="i.id" :item="i"
                                                         :model="this_model" @item-action="startAction($event, 'left')"
                                                         @finish-action="finishAction"/>
                            </div>
                            <!-- model is paginated and needs managed -->
                            <generic-infinite-cards v-if="paginated" :card_counts="left_counts" :scroll="show_split"
                                                    @search="getItems($event, 'left')" @reset="resetList('left')">
                                <template v-slot:cards>
                                    <generic-horizontal-card v-for="i in items_left" v-bind:key="i.id" :item="i"
                                                             :model="this_model"
                                                             @item-action="startAction($event, 'left')"
                                                             @finish-action="finishAction"/>
                                </template>
                            </generic-infinite-cards>
                        </div>
                        <div class="col col-md-6" v-if="show_split">
                            <generic-infinite-cards v-if="this_model" :card_counts="right_counts" :scroll="show_split"
                                                    @search="getItems($event, 'right')" @reset="resetList('right')">
                                <template v-slot:cards>
                                    <generic-horizontal-card v-for="i in items_right" v-bind:key="i.id" :item="i"
                                                             :model="this_model"
                                                             @item-action="startAction($event, 'right')"
                                                             @finish-action="finishAction"/>
                                </template>
                            </generic-infinite-cards>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"

import {CardMixin, ApiMixin, getConfig, resolveDjangoUrl} from "@/utils/utils"
import {StandardToasts, ToastMixin} from "@/utils/utils"

import GenericInfiniteCards from "@/components/GenericInfiniteCards"
import GenericHorizontalCard from "@/components/GenericHorizontalCard"
import GenericModalForm from "@/components/Modals/GenericModalForm"
import ModelMenu from "@/components/ContextMenu/ModelMenu"
import {ApiApiFactory} from "@/utils/openapi/api"
//import StorageQuota from "@/components/StorageQuota";

Vue.use(BootstrapVue)

export default {
    // TODO ApiGenerator doesn't capture and share error information - would be nice to share error details when available
    // or i'm capturing it incorrectly
    name: "ModelListView",
    mixins: [CardMixin, ApiMixin, ToastMixin],
    components: {
        GenericHorizontalCard,
        GenericModalForm,
        GenericInfiniteCards,
        ModelMenu,
    },
    data() {
        return {
            // this.Models and this.Actions inherited from ApiMixin
            items_left: [],
            items_right: [],
            right_counts: {max: 9999, current: 0},
            left_counts: {max: 9999, current: 0},
            this_model: undefined,
            model_menu: undefined,
            this_action: undefined,
            this_recipe_param: undefined,
            this_item: {},
            this_target: {},
            show_modal: false,
            show_split: false,
            paginated: false,
            header_component_name: undefined,
        }
    },
    computed: {
        headerComponent() {
            // TODO this leads webpack to create one .js file for each component in this folder because at runtime any one of them could be requested
            // TODO this is not necessarily bad but maybe there are better options to do this
            return () => import(/* webpackChunkName: "header-component" */ `@/components/${this.header_component_name}`)
        },
        apiName() {
            return this.this_model?.apiName
        },
    },
    mounted() {
        // value is passed from lists.py
        let model_config = JSON.parse(document.getElementById("model_config").textContent)
        this.this_model = this.Models[model_config?.model]
        this.this_recipe_param = model_config?.recipe_param
        this.paginated = this.this_model?.paginated ?? false
        this.header_component_name = this.this_model?.list?.header_component?.name ?? undefined
        this.$nextTick(() => {
            if (!this.paginated) {
                this.getItems({page: 1}, "left")
            }
        })
        this.$i18n.locale = window.CUSTOM_LOCALE
    },
    methods: {
        // this.genericAPI inherited from ApiMixin
        resetList: function (e) {
            this["items_" + e] = []
            this[e + "_counts"].max = 9999 + Math.random()
            this[e + "_counts"].current = 0
        },
        startAction: function (e, param) {
            let source = e?.source ?? {}
            let target = e?.target ?? undefined
            this.this_item = source
            this.this_target = target
            switch (e.action) {
                case "delete":
                    this.this_action = this.Actions.DELETE
                    this.show_modal = true
                    break
                case "new":
                    this.this_action = this.Actions.CREATE
                    this.show_modal = true
                    break
                case "edit":
                    this.this_item = e.source
                    this.this_action = this.Actions.UPDATE
                    this.show_modal = true
                    break
                case "ingredient-editor": {
                    let url = resolveDjangoUrl("view_ingredient_editor")
                    if (this.this_model === this.Models.FOOD) {
                        window.open(url + '?food_id=' + e.source.id, "_blank");
                    }
                    if (this.this_model === this.Models.UNIT) {
                        window.open(url + '?unit_id=' + e.source.id, "_blank");
                    }
                    break
                }
                case "move":
                    if (target == null) {
                        this.this_item = e.source
                        this.this_action = this.Actions.MOVE
                        this.show_modal = true
                    } else {
                        // this is redundant - function also exists in GenericModal
                        this.moveThis(source.id, target.id)
                    }
                    break
                case "merge":
                    if (target == null) {
                        this.this_item = e.source
                        this.this_action = this.Actions.MERGE
                        this.show_modal = true
                    } else {
                        // this is redundant - function also exists in GenericModal
                        this.mergeThis(e.source, e.target, false)
                    }
                    break
                case "merge-automate":
                    if (target == null) {
                        this.this_item = e.source
                        this.this_action = this.Actions.MERGE
                        this.this_item.automate = true
                        this.show_modal = true
                    } else {
                        // this is redundant - function also exists in GenericModal
                        this.mergeThis(e.source, e.target, true)
                    }
                    break
                case "get-children":
                    if (source.show_children) {
                        Vue.set(source, "show_children", false)
                    } else {
                        this.getChildren(param, source)
                    }
                    break
                case "get-recipes":
                    if (source.show_recipes) {
                        Vue.set(source, "show_recipes", false)
                    } else {
                        this.getRecipes(param, source)
                    }
                    break
            }
        },
        finishAction: function (e) {
            let update = undefined
            switch (e?.action) {
                case "save":
                    this.saveThis(e.form_data)
                    break
            }
            if (e !== "cancel") {
                switch (this.this_action) {
                    case this.Actions.DELETE:
                        this.deleteThis(this.this_item.id)
                        break
                    case this.Actions.CREATE:
                        this.saveThis(e.item)
                        break
                    case this.Actions.UPDATE:
                        this.updateThis(this.this_item)
                        break
                    case this.Actions.MERGE:
                        this.mergeUpdateItem(this.this_item.id, e.target)
                        break
                    case this.Actions.MOVE:
                        this.moveUpdateItem(this.this_item.id, e.target)
                        break
                }
            }
            this.clearState()
        },
        getItems: function (params = {}, col) {
            let column = col || "left"
            params.options = {query: {extended: 1}} // returns extended values in API response
            this.genericAPI(this.this_model, this.Actions.LIST, params)
                .then((result) => {
                    let results = result.data?.results ?? result.data

                    if (results?.length) {
                        this["items_" + column] = this["items_" + column].concat(results)
                        this[column + "_counts"]["current"] = getConfig(this.this_model, this.Actions.LIST).config.pageSize.default * (params.page - 1) + results.length
                        this[column + "_counts"]["max"] = result.data?.count ?? 0
                    } else {
                        this[column + "_counts"]["max"] = 0
                        this[column + "_counts"]["current"] = 0
                        console.log("no data returned")
                    }
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this,StandardToasts.FAIL_FETCH, err)
                })
        },
        getThis: function (id, callback) {
            return this.genericAPI(this.this_model, this.Actions.FETCH, {id: id})
        },
        saveThis: function (item) {
            if (!item?.id) {
                // if there is no item id assume it's a new item
                this.genericAPI(this.this_model, this.Actions.CREATE, item)
                    .then((result) => {
                        // look for and destroy any existing cards to prevent duplicates in the GET case of get_or_create
                        // then place all new items at the top of the list - could sort instead
                        this.items_left = [result.data].concat(this.destroyCard(result?.data?.id, this.items_left))
                        // this creates a deep copy to make sure that columns stay independent
                        this.items_right = [{...result.data}].concat(this.destroyCard(result?.data?.id, this.items_right))
                        StandardToasts.makeStandardToast(this,StandardToasts.SUCCESS_CREATE)
                    })
                    .catch((err) => {
                        StandardToasts.makeStandardToast(this,StandardToasts.FAIL_CREATE, err)
                    })
            } else {
                this.genericAPI(this.this_model, this.Actions.UPDATE, item)
                    .then((result) => {
                        this.refreshThis(item.id)
                        StandardToasts.makeStandardToast(this,StandardToasts.SUCCESS_UPDATE)
                    })
                    .catch((err) => {
                        StandardToasts.makeStandardToast(this,StandardToasts.FAIL_UPDATE, err)
                    })
            }
        },
        // this currently assumes shopping is only applicable on FOOD model
        addShopping: function (food) {
            let api = new ApiApiFactory()
            food.shopping = true
            api.createShoppingListEntry({food: food, amount: 1}).then(() => {
                StandardToasts.makeStandardToast(this,StandardToasts.SUCCESS_CREATE)
                this.refreshCard(food, this.items_left)
                this.refreshCard({...food}, this.items_right)
            })
        },
        updateThis: function (item) {
            this.refreshThis(item.id)
        },
        moveThis: function (source_id, target_id) {
            // TODO: this function is almost 100% duplicated in GenericModalForm and only exists to enable drag and drop
            if (source_id === target_id) {
                this.makeToast(this.$t("Error"), this.$t("err_move_self"), "danger")
                this.clearState()
                return
            }
            let item = this.findCard(source_id, this.items_left) || this.findCard(source_id, this.items_right)
            if (source_id === undefined || target_id === undefined || item?.parent == target_id) {
                this.makeToast(this.$t("Warning"), this.$t("nothing"), "warning")
                this.clearState()
                return
            }
            this.genericAPI(this.this_model, this.Actions.MOVE, {source: source_id, target: target_id})
                .then((result) => {
                    this.moveUpdateItem(source_id, target_id)
                    StandardToasts.makeStandardToast(this,StandardToasts.SUCCESS_MOVE)
                })
                .catch((err) => {
                    console.log(err)
                    this.makeToast(this.$t("Error"), err.bodyText, "danger")
                })
        },
        moveUpdateItem: function (source_id, target_id) {
            let item = this.findCard(source_id, this.items_left) || this.findCard(source_id, this.items_right)
            if (target_id === 0) {
                this.items_left = [item].concat(this.destroyCard(source_id, this.items_left)) // order matters, destroy old card before adding it back in at root
                this.items_right = [...[item]].concat(this.destroyCard(source_id, this.items_right)) // order matters, destroy old card before adding it back in at root
                item.parent = null
            } else {
                this.items_left = this.destroyCard(source_id, this.items_left)
                this.items_right = this.destroyCard(source_id, this.items_right)
                this.refreshThis(target_id)
            }
        },
        mergeThis: function (source, target, automate) {
            // TODO: this function is almost 100% duplicated in GenericModalForm and only exists to enable drag and drop
            let source_id = source.id
            let target_id = target.id
            if (source_id === target_id) {
                this.makeToast(this.$t("Error"), this.$t("err_merge_self"), "danger")
                this.clearState()
                return
            }
            if (!source_id || !target_id) {
                this.makeToast(this.$t("Warning"), this.$t("nothing"), "warning")
                this.clearState()
                return
            }
            this.genericAPI(this.this_model, this.Actions.MERGE, {
                source: source_id,
                target: target_id,
            })
                .then((result) => {
                    this.mergeUpdateItem(source_id, target_id)
                    StandardToasts.makeStandardToast(this,StandardToasts.SUCCESS_MERGE)
                })
                .catch((err) => {
                    //TODO error checking not working with OpenAPI methods
                    console.log("Error", err)
                    this.makeToast(this.$t("Error"), err.bodyText, "danger")
                })

            if (automate) {
                let apiClient = new ApiApiFactory()

                let automation = {
                    name: `Merge ${source.name} with ${target.name}`,
                    param_1: source.name,
                    param_2: target.name,
                }

                if (this.this_model === this.Models.FOOD) {
                    automation.type = "FOOD_ALIAS"
                }
                if (this.this_model === this.Models.UNIT) {
                    automation.type = "UNIT_ALIAS"
                }
                if (this.this_model === this.Models.KEYWORD) {
                    automation.type = "KEYWORD_ALIAS"
                }

                apiClient.createAutomation(automation)
            }
        },
        mergeUpdateItem: function (source, target, automate) {
            this.items_left = this.destroyCard(source, this.items_left)
            this.items_right = this.destroyCard(source, this.items_right)
            this.refreshThis(target)
        },
        getChildren: function (col, item) {
            let parent = {}
            let params = {
                root: item.id,
                pageSize: 200,
                query: {extended: 1},
                options: {query: {extended: 1}},
            }
            this.genericAPI(this.this_model, this.Actions.LIST, params)
                .then((result) => {
                    parent = this.findCard(item.id, this["items_" + col])
                    if (parent) {
                        Vue.set(parent, "children", result.data.results)
                        Vue.set(parent, "show_children", true)
                        Vue.set(parent, "show_recipes", false)
                    }
                })
                .catch((err) => {
                    console.log(err)
                    StandardToasts.makeStandardToast(this,StandardToasts.FAIL_FETCH, err)
                })
        },
        getRecipes: function (col, item) {
            let parent = {}
            // TODO: make this generic
            let params = {pageSize: 50, random: true}
            params[this.this_recipe_param] = item.id
            this.genericAPI(this.Models.RECIPE, this.Actions.LIST, params)
                .then((result) => {
                    parent = this.findCard(item.id, this["items_" + col])
                    if (parent) {
                        Vue.set(parent, "recipes", result.data.results)
                        Vue.set(parent, "show_recipes", true)
                        Vue.set(parent, "show_children", false)
                    }
                })
                .catch((err) => {
                    console.log(err)
                    this.makeToast(this.$t("Error"), err.bodyText, "danger")
                })
        },
        refreshThis: function (id) {
            this.getThis(id).then((result) => {
                this.refreshCard(result.data, this.items_left)
                this.refreshCard({...result.data}, this.items_right)
            })
        },
        deleteThis: function (id) {
            this.items_left = this.destroyCard(id, this.items_left)
            this.items_right = this.destroyCard(id, this.items_right)
        },
        clearState: function () {
            this.show_modal = false
            this.this_action = undefined
            this.this_item = undefined
            this.this_target = undefined
        },
    },
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style></style>
