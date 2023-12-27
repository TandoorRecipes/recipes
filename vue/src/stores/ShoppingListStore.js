import {ApiApiFactory} from "@/utils/openapi/api"
import {StandardToasts} from "@/utils/utils"
import {defineStore} from "pinia"
import Vue from "vue"
import _ from 'lodash';
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";

const _STORE_ID = "shopping_list_store"
/*
 * test store to play around with pinia and see if it can work for my use cases
 * don't trust that all shopping list entries are in store as there is no cache validation logic, its just a shared data holder
 * */
export const useShoppingListStore = defineStore(_STORE_ID, {
    state: () => ({
        // shopping data
        entries: {},
        supermarket_categories: [],
        supermarkets: [],

        // internal
        currently_updating: false,

        // constants
        GROUP_CATEGORY: 'food.supermarket_category.name',
        GROUP_CREATED_BY: 'created_by.display_name',
        GROUP_RECIPE: 'recipe_mealplan.recipe_name',
        GROUP_MEALPLAN: 'recipe_mealplan.mealplan', //TODO give this some name from the API

        UNDEFINED_CATEGORY: 'shopping_undefined_category'
    }),
    getters: {
        /**
         * build a multi-level data structure ready for display from shopping list entries
         * group by selected grouping key
         * @return {{}}
         */
        get_entries_by_group: function () {
            let structure = {}
            let ordered_structure = []

            for (let i in this.entries) {
                structure = this.updateEntryInStructure(structure, this.entries[i], useUserPreferenceStore().device_settings.shopping_selected_grouping)
            }

            if (useUserPreferenceStore().device_settings.shopping_selected_grouping === this.GROUP_CATEGORY && useUserPreferenceStore().device_settings.shopping_selected_supermarket !== null) {
                if (this.UNDEFINED_CATEGORY in structure) {
                    ordered_structure.push(structure[this.UNDEFINED_CATEGORY])
                    Vue.delete(structure, this.UNDEFINED_CATEGORY)
                }

                for (let c of useUserPreferenceStore().device_settings.shopping_selected_supermarket.category_to_supermarket) {
                    if (c.category.name in structure) {
                        ordered_structure.push(structure[c.category.name])
                        Vue.delete(structure, c.category.name)
                    }
                }
                if (!useUserPreferenceStore().device_settings.shopping_show_selected_supermarket_only) {
                    for (let i in structure) {
                        ordered_structure.push(structure[i])
                    }
                }
            } else {
                for (let i in structure) {
                    ordered_structure.push(structure[i])
                }
            }

            return ordered_structure
        },

        grouping_options: function () {
            return [{'id': this.GROUP_CATEGORY, 'translatable_label': 'Category'}, {'id': this.GROUP_CREATED_BY, 'translatable_label': 'created_by'}, {'id': this.GROUP_RECIPE, 'translatable_label': 'Recipe'}]
        }

    },
    actions: {
        // TODO implement shopping list recipes
        /**
         * Retrieves all shopping related data (shopping list entries, supermarkets, supermarket categories and shopping list recipes) from API
         */
        refreshFromAPI() {
            if (!this.currently_updating) {
                this.currently_updating = true
                let apiClient = new ApiApiFactory()
                apiClient.listShoppingListEntrys().then((r) => {
                    r.data.forEach((e) => {
                        Vue.set(this.entries, e.id, e)
                    })
                    this.currently_updating = false
                }).catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
                })

                apiClient.listSupermarketCategorys().then(r => {
                    this.supermarket_categories = r.data
                }).catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
                })

                apiClient.listSupermarkets().then(r => {
                    this.supermarkets = r.data
                }).catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
                })
            }
        },
        /**
         * Create a new shopping list entry
         * adds new entry to store
         * @param object entry object to create
         * @return {Promise<T | void>} promise of creation call to subscribe to
         */
        createObject(object) {
            let apiClient = new ApiApiFactory()

            // TODO shared handled in backend?

            return apiClient.createShoppingListEntry(object).then((r) => {
                Vue.set(this.entries, r.data.id, r.data)
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        /**
         * update existing entry object
         * updates data in store
         * @param object entry object to update
         * @return {Promise<T | void>} promise of updating call to subscribe to
         */
        updateObject(object) {
            let apiClient = new ApiApiFactory()
            return apiClient.updateShoppingListEntry(object.id, object).then((r) => {
                Vue.set(this.entries, r.data.id, r.data)
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        /**
         * delete shopping list entry object from DB and store
         * @param object entry object to delete
         * @return {Promise<T | void>} promise of delete call to subscribe to
         */
        deleteObject(object) {
            let apiClient = new ApiApiFactory()
            return apiClient.destroyShoppingListEntry(object.id).then((r) => {
                Vue.delete(this.entries, object.id)
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
            })
        },
        // convenience methods
        /**
         * function to set entry to its proper place in the data structure to perform grouping
         * @param {{}} structure datastructure
         * @param {*} entry entry to place
         * @param {*} group group to place entry into (must be of ShoppingListStore.GROUP_XXX/dot notation of entry property)
         * @returns updated datastructure including entry
         */
        updateEntryInStructure(structure, entry, group) {
            let grouping_key = _.get(entry, group, this.UNDEFINED_CATEGORY)
            // todo handele parent
            if (grouping_key === undefined || grouping_key === null) {
                grouping_key = this.UNDEFINED_CATEGORY
            }

            if (!(grouping_key in structure)) {
                Vue.set(structure, grouping_key, {'name': grouping_key, 'foods': {}})
            }
            if (!(entry.food.id in structure[grouping_key]['foods'])) {
                Vue.set(structure[grouping_key]['foods'], entry.food.id, {'id': entry.food.id, 'name': entry.food.name, 'entries': {}})
            }
            Vue.set(structure[grouping_key]['foods'][entry.food.id]['entries'], entry.id, entry)
            return structure
        },
        /**
         * function to handle user checking or unchecking a set of entries
         * @param {{}} entries set of entries
         * @param checked boolean to set checked state of entry to
         */
        setEntriesCheckedState(entries, checked) {
            for (let i in entries) {
                this.entries[i].checked = checked
                this.updateObject(this.entries[i])
            }
        },
        /**
         * function to handle user "delaying" shopping entries
         * @param {{}} entries set of entries
         */
        delayEntries(entries) {
            let delay = 4 //TODO get delay from settings
            let delay_date = new Date(Date.now() + delay * (60 * 60 * 1000))

            for (let i in entries) {
                console.log('DELAYING ', i, ' until ', delay_date)
                this.entries[i].delay_until = delay_date
                this.updateObject(this.entries[i])
            }
        },
        /**
         * delete list of entries
         * @param {{}} entries set of entries
         */
        deleteEntries(entries) {
            for (let i in entries) {
                this.deleteObject(this.entries[i])
            }
        },
    },
})
