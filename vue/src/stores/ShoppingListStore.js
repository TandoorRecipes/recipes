import {ApiApiFactory} from "@/utils/openapi/api"
import {StandardToasts} from "@/utils/utils"
import {defineStore} from "pinia"
import Vue from "vue"
import _ from 'lodash';

const _STORE_ID = "shopping_list_store"
const _LOCAL_STORAGE_KEY = "SHOPPING_LIST_CLIENT_SETTINGS"
/*
 * test store to play around with pinia and see if it can work for my use cases
 * don't trust that all shopping list entries are in store as there is no cache validation logic, its just a shared data holder
 * */
export const useShoppingListStore = defineStore(_STORE_ID, {
    state: () => ({
        entries: {},

        category_food_entries: {},
        supermarket_categories: [],

        show_checked_entries: false, // TODO move to settings

        currently_updating: false,
        settings: null,


        GROUP_CATEGORY: 'food.supermarket_category.name',
        GROUP_CREATED_BY: 'created_by.display_name',
        GROUP_RECIPE: 'recipe_mealplan.recipe_name',
        GROUP_MEALPLAN: 'recipe_mealplan.mealplan', //TODO give this some name from the API

        selected_group: 'food.supermarket_category.name',
    }),
    getters: {

        get_entries_by_group: function () {
            let structure = {}
            for (let i in this.entries) {
                structure = this.updateEntryInStructure(structure, this.entries[i], this.selected_group)
            }
            return structure
        },

        client_settings: function () {
            if (this.settings === null) {
                this.settings = this.loadClientSettings()
            }
            return this.settings
        },
    },
    actions: {
        refreshFromAPI() {
            /**
             * Retrieves all shopping list entries from the API and parses them into a structured object category > food > entry
             */
            this.category_food_entries = {}
            Vue.set(this.category_food_entries, -1, {'id': -1, 'name': '', foods: {}})

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
            }
        },
        createObject(object) {
            let apiClient = new ApiApiFactory()

            // TODO shared handled in backend?

            return apiClient.createShoppingListEntry(object).then((r) => {
                Vue.set(this.entries, r.data.id, r.data)
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        updateObject(object) {
            let apiClient = new ApiApiFactory()
            return apiClient.updateShoppingListEntry(object.id, object).then((r) => {
                Vue.set(this.entries, r.data.id, r.data)
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        deleteObject(object) {
            let apiClient = new ApiApiFactory()
            return apiClient.destroyShoppingListEntry(object.id).then((r) => {

                Vue.delete(this.category_food_entries[this.getFoodCategory(object.food)]['foods'][object.food.id]['entries'], object.id)
                if (Object.keys(this.category_food_entries[this.getFoodCategory(object.food)]['foods'][object.food.id]['entries']).length === 0) {
                    Vue.delete(this.category_food_entries[this.getFoodCategory(object.food)]['foods'], object.food.id)
                }
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
            })
        },
        updateClientSettings(settings) {
            // this.settings = settings
            // localStorage.setItem(_LOCAL_STORAGE_KEY, JSON.stringify(this.settings))
        },
        loadClientSettings() {
            // let s = localStorage.getItem(_LOCAL_STORAGE_KEY)
            // if (s === null || s === {}) {
            //     return {
            //         displayPeriodUom: "week",
            //         displayPeriodCount: 3,
            //         startingDayOfWeek: 1,
            //         displayWeekNumbers: true,
            //     }
            // } else {
            //     return JSON.parse(s)
            // }
        },

        // concenience methods
        getFoodCategory(food) {
            /**
             * Get category id from food or return -1 if food has no category
             */
            if (food.supermarket_category !== null) {
                return food.supermarket_category.id
            }
            return -1
        },
        /**
         * function to set entry to its proper place in the data structure to perform grouping
         * @param {{}} structure datastructure
         * @param {*} entry entry to place
         * @param {*} group group to place entry into (must be of ShoppingListStore.GROUP_XXX/dot notation of entry property)
         * @returns updated datastructure including entry
         */
        updateEntryInStructure(structure, entry, group) {
            let grouping_key = _.get(entry, group, -1)
            // todo handele parent
            if (grouping_key === undefined || grouping_key === null) {
                grouping_key = -1
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
        delayEntries(entries) {
            /**
             * function to handle user "delaying" shopping entry
             * takes a food object as an argument and delays all entries associated with the food
             */
            let delay = 4 //TODO get delay from settings
            let delay_date = new Date(Date.now() + delay * (60 * 60 * 1000))

            for (let i in entries) {
                console.log('DELAYING ', i, ' until ', delay_date)
                this.entries[i].delay_until = delay_date
                this.updateObject(this.entries[i])
            }
        },
        deleteFood(food) {
            /**
             * function to handle user deleting all entries of a certain food
             */
            let entries = this.category_food_entries[this.getFoodCategory(food)]['foods'][food.id]['entries']
            for (let i in entries) {
                this.deleteObject(entries[i])
            }
        },
    },
})
