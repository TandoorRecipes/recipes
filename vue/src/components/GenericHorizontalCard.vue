<template>
    <div row style="margin: 4px">
        <!-- @[useDrag&&`dragover`] <== this syntax completely shuts off draggable  -->
        <b-card
            no-body
            d-flex
            flex-column
            :class="{ 'border border-primary': over, shake: isError }"
            :style="{ 'cursor:grab': useDrag }"
            :draggable="useDrag"
            @[useDrag&&`dragover`||``].prevent
            @[useDrag&&`dragenter`||``].prevent
            @[useDrag&&`dragstart`||``]="handleDragStart($event)"
            @[useDrag&&`dragenter`||``]="handleDragEnter($event)"
            @[useDrag&&`dragleave`||``]="handleDragLeave($event)"
            @[useDrag&&`drop`||``]="handleDragDrop($event)"
        >
            <b-row no-gutters>
                <b-col no-gutters class="col-sm-3">
                    <b-card-img-lazy style="object-fit: cover; height: 6em" :src="item_image" v-bind:alt="$t('Recipe_Image')"></b-card-img-lazy>
                </b-col>
                <b-col no-gutters class="col-sm-9">
                    <b-card-body class="m-0 py-0">
                        <b-card-text class="h-100 my-0 d-flex flex-column" style="text-overflow: ellipsis">
                            <h5 class="m-0 mt-1 text-truncate">{{ item[title] }}</h5>

                                <div v-if="item[plural]!== '' && item[plural] !== null && item[plural] !== undefined" class="m-0 text-truncate">({{ $t("plural_short") }}: {{ item[plural] }})</div>

                            <div class="m-0 text-truncate">{{ item[subtitle] }}</div>
                            <div class="m-0 text-truncate small text-muted" v-if="getFullname">{{ getFullname }}</div>

                            <generic-pill v-for="x in itemTags" :key="x.field" :item_list="itemList(x)" :label="x.label" :color="x.color" />

                            <generic-ordered-pill
                                v-for="x in itemOrderedTags"
                                :key="x.field"
                                :item_list="item[x.field]"
                                :label="x.label"
                                :color="x.color"
                                :field="x.field"
                                :item="item"
                                @finish-action="finishAction"
                            />

                            <div class="mt-auto mb-1" align="right">
                                <span v-if="item[child_count]" class="mx-2 btn btn-link btn-sm" style="z-index: 800" v-on:click="$emit('item-action', { action: 'get-children', source: item })">
                                    <div v-if="!item.show_children">{{ item[child_count] }} {{ itemName }}</div>
                                    <div v-else>{{ text.hide_children }}</div>
                                </span>
                                <span v-if="item[recipe_count]" class="mx-2 btn btn-link btn-sm" style="z-index: 800" v-on:click="$emit('item-action', { action: 'get-recipes', source: item })">
                                    <div v-if="!item.show_recipes">{{ item[recipe_count] }} {{ $t("Recipes") }}</div>
                                    <div v-else>{{ $t("Hide_Recipes") }}</div>
                                </span>
                            </div>
                        </b-card-text>
                    </b-card-body>
                </b-col>
                <div class="card-img-overlay justify-content-right h-25 m-0 p-0 text-right">
                    <badges :item="item" :model="model" />
                    <generic-context-menu
                        v-if="show_context_menu"
                        class="p-0"
                        :show_merge="useMerge"
                        :show_move="useMove"
                        :show_shopping="useShopping"
                        :show_onhand="useOnhand"
                        :show_ingredient_editor="useIngredientEditor"
                        @item-action="$emit('item-action', { action: $event, source: item })"
                    >
                    </generic-context-menu>
                </div>
            </b-row>
        </b-card>
        <!-- recursively add child cards -->
        <div class="row" v-if="item.show_children">
            <div class="col-md-10 offset-md-2">
                <generic-horizontal-card v-for="child in item[children]"
                                         v-bind:key="child.id" 
                                         :item="child" :model="model"
                                         @item-action="$emit('item-action', $event)"></generic-horizontal-card>
            </div>
        </div>
        <!-- conditionally view recipes -->
        <div class="row" v-if="item.show_recipes">
            <div class="col-md-10 offset-md-2">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); grid-gap: 1rem">
                    <recipe-card v-for="r in item[recipes]" v-bind:key="r.id" :recipe="r"> </recipe-card>
                </div>
            </div>
        </div>
        <!-- this should be made a generic component, would also require mixin for functions that generate the popup and put in parent container-->
        <b-list-group ref="tooltip" variant="light" v-show="show_menu" v-on-clickaway="closeMenu" style="z-index: 9999; cursor: pointer">
            <b-list-group-item
                v-if="useMove"
                action
                v-on:click="
                    $emit('item-action', { action: 'move', target: item, source: source })
                    closeMenu()
                "
            >
                <i class="fas fa-expand-arrows-alt fa-fw"></i> <b>{{ $t("Move") }}</b
                >: <span v-html="$t('move_confirmation', { child: $sanitize(source.name), parent: $sanitize(item.name) })"></span>
            </b-list-group-item>
            <b-list-group-item
                v-if="useMerge"
                action
                v-on:click="
                    $emit('item-action', { action: 'merge', target: item, source: source })
                    closeMenu()
                "
            >
                <i class="fas fa-compress-arrows-alt fa-fw"></i> <b>{{ $t("Merge") }}</b
                >: <span v-html="$t('merge_confirmation', { source: $sanitize(source.name), target: $sanitize(item.name) })"></span>
            </b-list-group-item>
            <b-list-group-item
                v-if="useMerge"
                action
                v-on:click="
                    $emit('item-action', { action: 'merge-automate', target: item, source: source })
                    closeMenu()
                "
            >
                <i class="fas fa-robot fa-fw"></i> <b>{{ $t("Merge") }} & {{ $t("Automate") }}</b
                >: <span v-html="$t('merge_confirmation', { source: $sanitize(source.name), target: $sanitize(item.name) })"></span> {{ $t("create_rule") }}
                <b-badge v-b-tooltip.hover :title="$t('warning_feature_beta')">BETA</b-badge>
            </b-list-group-item>
            <b-list-group-item action v-on:click="closeMenu()">
                <i class="fas fa-times fa-fw"></i> <b>{{ $t("Cancel") }}</b>
            </b-list-group-item>
        </b-list-group>
    </div>
</template>

<script>
import GenericContextMenu from "@/components/ContextMenu/GenericContextMenu"
import Badges from "@/components/Badges"
import GenericPill from "@/components/GenericPill"
import GenericOrderedPill from "@/components/GenericOrderedPill"
import RecipeCard from "@/components/RecipeCard"
import { mixin as clickaway } from "vue-clickaway"
import { createPopper } from "@popperjs/core"
import {ApiMixin} from "@/utils/utils";
import Vue from "vue"
import VueSanitize from "vue-sanitize";
Vue.use(VueSanitize);

export default {
    name: "GenericHorizontalCard",
    components: { GenericContextMenu, RecipeCard, Badges, GenericPill, GenericOrderedPill },
    mixins: [clickaway, ApiMixin],
    props: {
        item: { type: Object },
        model: { type: Object },
        title: { type: String, default: "name" }, // this and the following props need to be moved to model.js and made computed values
        plural: { type: String, default: "plural_name" },
        subtitle: { type: String, default: "description" },
        child_count: { type: String, default: "numchild" },
        children: { type: String, default: "children" },
        recipe_count: { type: String, default: "numrecipe" },
        recipes: { type: String, default: "recipes" },
        show_context_menu: { type: Boolean, default: true },
    },
    data() {
        return {
            item_image: "",
            over: false,
            show_menu: false,
            dragMenu: undefined,
            isError: false,
            source: { id: undefined, name: undefined },
            target: { id: undefined, name: undefined },
            text: {
                hide_children: "",
            },
        }
    },
    mounted() {
        this.item_image = this.item?.image ?? window.IMAGE_PLACEHOLDER
        this.dragMenu = this.$refs.tooltip
        this.text.hide_children = this.$t("Hide_" + this.itemName)
    },
    computed: {
        itemName: function () {
            return this.model?.name ?? "You Forgot To Set Model Name in model.js"
        },
        useMove: function () {
            return this.model?.["move"] ?? false ? true : false
        },
        useMerge: function () {
            return this.model?.["merge"] ?? false ? true : false
        },
        useShopping: function () {
            return this.model?.["shop"] ?? false ? true : false
        },
        useOnhand: function () {
            return this.model?.["onhand"] ?? false ? true : false
        },
        useDrag: function () {
            return this.useMove || this.useMerge
        },
        useIngredientEditor: function (){
            return (this.model === this.Models.FOOD || this.model === this.Models.UNIT)
        },
        itemTags: function () {
            return this.model?.tags ?? []
        },
        itemOrderedTags: function () {
            return this.model?.ordered_tags ?? []
        },
        getFullname: function () {
            if (!this.item?.full_name?.includes(">")) {
                return undefined
            }
            return this.item?.full_name
        },
    },
    methods: {
        handleDragStart: function (e) {
            this.isError = false
            e.dataTransfer.setData("source", JSON.stringify(this.item))
        },
        handleDragEnter: function (e) {
            if (!e.currentTarget.contains(e.relatedTarget) && e.relatedTarget != null) {
                this.over = true
            }
        },
        handleDragLeave: function (e) {
            if (!e.currentTarget.contains(e.relatedTarget)) {
                this.over = false
            }
        },
        handleDragDrop: function (e) {
            let source = JSON.parse(e.dataTransfer.getData("source"))
            if (source.id != this.item.id) {
                this.source = source
                let menuLocation = { getBoundingClientRect: this.generateLocation(e.clientX, e.clientY) }
                this.show_menu = true
                let popper = createPopper(menuLocation, this.dragMenu, {
                    placement: "bottom-start",
                    modifiers: [
                        {
                            name: "preventOverflow",
                            options: {
                                rootBoundary: "document",
                            },
                        },
                        {
                            name: "flip",
                            options: {
                                fallbackPlacements: ["bottom-end", "top-start", "top-end", "left-start", "right-start"],
                                rootBoundary: "document",
                            },
                        },
                    ],
                })
                popper.update()
                this.over = false
            } else {
                this.isError = true
            }
        },
        generateLocation: function (x = 0, y = 0) {
            return () => ({
                width: 0,
                height: 0,
                top: y,
                right: x,
                bottom: y,
                left: x,
            })
        },
        closeMenu: function () {
            this.show_menu = false
        },
        finishAction: function (e) {
            this.$emit("finish-action", e)
        },
        itemList: function (tag) {
            let itemlist = this.item?.[tag?.field] ?? []
            if (Array.isArray(itemlist)) {
                return itemlist
            } else {
                return [itemlist]
            }
        },
    },
}
</script>

<style scoped>
.shake {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
}

@keyframes shake {
    10%,
    90% {
        transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
        transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
        transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
        transform: translate3d(4px, 0, 0);
    }
}
</style>
