import {ApiApiFactory} from "@/utils/openapi/api"
import {StandardToasts} from "@/utils/utils"
import {defineStore} from "pinia"
import Vue from "vue"

const _STORE_ID = "shopping_list_store"
const _LOCAL_STORAGE_KEY = "SHOPPING_LIST_CLIENT_SETTINGS"
/*
 * test store to play around with pinia and see if it can work for my usecases
 * dont trust that all shopping list entries are in store as there is no cache validation logic, its just a shared data holder
 * */
export const useShoppingListStore = defineStore(_STORE_ID, {
    state: () => ({
        category_food_entries: {},
        supermarket_categories: [],

        show_checked_entries: false, // TODO move to settings

        currently_updating: false,
        settings: null,
    }),
    getters: {

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
                        this.updateEntryInStructure(e)
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
                this.updateEntryInStructure(r.data)
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        updateObject(object) {
            let apiClient = new ApiApiFactory()
            return apiClient.updateShoppingListEntry(object.id, object).then((r) => {
                this.updateEntryInStructure(r.data)
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
        updateEntryInStructure(entry) {
            let category = this.getFoodCategory(entry.food)
            if (!(category in this.category_food_entries)) {
                Vue.set(this.category_food_entries, category, {'id': category, 'name': entry.food.supermarket_category.name, 'foods': {}})
            }
            if (!(entry.food.id in this.category_food_entries[category]['foods'])) {
                Vue.set(this.category_food_entries[category]['foods'], entry.food.id, {'id': entry.food.id, 'name': entry.food.name, 'entries': {}})
            }
            Vue.set(this.category_food_entries[category]['foods'][entry.food.id]['entries'], entry.id, entry)
        },
        setFoodCheckedState(food, checked) {
            /**
             * function to handle user checking or unchecking a food
             */

            let entries = this.category_food_entries[this.getFoodCategory(food)]['foods'][food.id]['entries']
            for (let i in entries) {
                entries[i].checked = checked
                this.updateObject(entries[i])
            }
        },
        delayFood(food) {
            /**
             * function to handle user "delaying" shopping entry
             * takes a food object as an argument and delays all entries associated with the food
             */
            let delay = 4 //TODO get delay from settings
            let delay_date = new Date(Date.now() + delay * (60 * 60 * 1000))

            let entries = this.category_food_entries[this.getFoodCategory(food)]['foods'][food.id]['entries']
            for (let i in entries) {
                entries[i].delayed_until = delay_date
                this.updateObject(entries[i])
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
