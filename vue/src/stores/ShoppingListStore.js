import {ApiApiFactory} from "@/utils/openapi/api"
import {StandardToasts} from "@/utils/utils"
import {defineStore} from "pinia"
import Vue from "vue"
import _ from 'lodash';
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import moment from "moment/moment";

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
        last_autosync: null,
        undo_stack: [],
        autosync_has_focus: false,

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

            // build structure
            for (let i in this.entries) {
                structure = this.updateEntryInStructure(structure, this.entries[i], useUserPreferenceStore().device_settings.shopping_selected_grouping)
            }

            // statistics for UI conditions and display
            let total_unchecked = 0
            let total_checked = 0
            let total_unchecked_food = 0
            let total_checked_food = 0
            for (let i in structure) {
                let count_unchecked = 0
                let count_checked = 0
                let count_unchecked_food = 0
                let count_checked_food = 0

                for (let fi in structure[i]['foods']) {
                    let food_checked = true
                    for (let ei in structure[i]['foods'][fi]['entries']) {
                        if (structure[i]['foods'][fi]['entries'][ei].checked) {
                            count_checked++
                        } else {
                            food_checked = false
                            count_unchecked++
                        }
                    }
                    if (food_checked) {
                        count_checked_food++
                    } else {
                        count_unchecked_food++
                    }
                }

                Vue.set(structure[i], 'count_unchecked', count_unchecked)
                Vue.set(structure[i], 'count_checked', count_checked)
                Vue.set(structure[i], 'count_unchecked_food', count_unchecked_food)
                Vue.set(structure[i], 'count_checked_food', count_checked_food)

                total_unchecked += count_unchecked
                total_checked += count_checked
                total_unchecked_food += count_unchecked_food
                total_checked_food += count_checked_food
            }
            // Vue.set(structure, 'count_unchecked', total_unchecked)
            // Vue.set(structure, 'count_checked', total_checked)
            // Vue.set(structure, 'count_unchecked_food', total_unchecked_food)
            // Vue.set(structure, 'count_checked_food', total_checked_food)

            // ordering
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
        /**
         * list of options available for grouping entry display
         * @return {[{id: *, translatable_label: string},{id: *, translatable_label: string},{id: *, translatable_label: string}]}
         */
        grouping_options: function () {
            return [{'id': this.GROUP_CATEGORY, 'translatable_label': 'Category'}, {
                'id': this.GROUP_CREATED_BY,
                'translatable_label': 'created_by'
            }, {
                'id': this.GROUP_RECIPE,
                'translatable_label': 'Recipe'
            }]
        },
    },
    actions: {
        /**
         * Retrieves all shopping related data (shopping list entries, supermarkets, supermarket categories and shopping list recipes) from API
         */
        refreshFromAPI() {
            if (!this.currently_updating) {
                this.currently_updating = true
                let apiClient = new ApiApiFactory()
                apiClient.listShoppingListEntrys().then((r) => {
                    this.entries = {}

                    r.data.forEach((e) => {
                        Vue.set(this.entries, e.id, e)
                    })
                    this.currently_updating = false
                }).catch((err) => {
                    this.currently_updating = false
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
        autosync() {
            if (!this.currently_updating && this.autosync_has_focus) {
                console.log('running autosync')
                this.currently_updating = true

                let previous_autosync = this.last_autosync
                this.last_autosync = new Date().getTime();

                let apiClient = new ApiApiFactory()
                apiClient.listShoppingListEntrys(undefined, undefined, undefined, {
                    'query': {'last_autosync': previous_autosync}
                }).then((r) => {
                    r.data.forEach((e) => {
                        // dont update stale client data
                        if (Date.parse(this.entries[e.id].updated_at) <= Date.parse(e.updated_at)) { //TODO validate the django datetime can be parsed in all browsers
                            console.log('updating entry ', e)
                            Vue.set(this.entries, e.id, e)
                        }
                    })
                    this.currently_updating = false
                }).catch((err) => {
                    console.log('auto sync failed')
                    this.currently_updating = false
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

                this.registerChange('CREATED', {[r.data.id]: r.data},)
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        /**
         * update existing entry object and updated_at timestamp
         * updates data in store
         * IMPORTANT: always use this method to update objects to keep client state consistent
         * @param object entry object to update
         * @return {Promise<T | void>} promise of updating call to subscribe to
         */
        updateObject(object) {
            let apiClient = new ApiApiFactory()
            // sets the update_at timestamp on the client to prevent auto sync from overriding with older changes
            // moment().format() yields locale aware datetime without ms 2024-01-04T13:39:08.607238+01:00
            Vue.set(object, 'update_at', moment().format())

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
        /**
         * returns a distinct list of recipes associated with unchecked shopping list entries
         */
        getAssociatedRecipes: function () {
            let recipes = {}

            for (let i in this.entries) {
                let e = this.entries[i]
                if (e.recipe_mealplan !== null) {
                    Vue.set(recipes, e.recipe_mealplan.recipe, {
                        'shopping_list_recipe_id': e.list_recipe,
                        'recipe_id': e.recipe_mealplan.recipe,
                        'recipe_name': e.recipe_mealplan.recipe_name,
                        'servings': e.recipe_mealplan.servings
                    })
                }
            }

            return recipes
        },
        // convenience methods
        /**
         * function to set entry to its proper place in the data structure to perform grouping
         * @param {{}} structure datastructure
         * @param {*} entry entry to place
         * @param {*} group group to place entry into (must be of ShoppingListStore.GROUP_XXX/dot notation of entry property)
         * @returns {{}} datastructure including entry
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
                Vue.set(structure[grouping_key]['foods'], entry.food.id, {
                    'id': entry.food.id,
                    'name': entry.food.name,
                    'entries': {}
                })
            }
            Vue.set(structure[grouping_key]['foods'][entry.food.id]['entries'], entry.id, entry)
            return structure
        },
        /**
         * function to handle user checking or unchecking a set of entries
         * @param {{}} entries set of entries
         * @param checked boolean to set checked state of entry to
         * @param undo if the user should be able to undo the change or not
         */
        setEntriesCheckedState(entries, checked, undo) {
            if (undo) {
                this.registerChange((checked ? 'CHECKED' : 'UNCHECKED'), entries)
            }

            let entry_id_list = []
            for (let i in entries) {
                Vue.set(this.entries[i], 'checked', checked)
                Vue.set(this.entries[i], 'update_at', moment().format())
                entry_id_list.push(i)
            }

            let apiClient = new ApiApiFactory()
            apiClient.bulkShoppingListEntry({'ids': entry_id_list, 'checked': checked}).then((r) => {

            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        /**
         * function to handle user "delaying" and "undelaying" shopping entries
         * @param {{}} entries set of entries
         * @param delay if entries should be delayed or if delay should be removed
         * @param undo if the user should be able to undo the change or not
         */
        delayEntries(entries, delay, undo) {
            let delay_hours = 4 //TODO get delay from settings in an offline friendly way
            let delay_date = new Date(Date.now() + delay_hours * (60 * 60 * 1000))

            if (undo) {
                this.registerChange((delay ? 'DELAY' : 'UNDELAY'), entries)
            }

            for (let i in entries) {
                this.entries[i].delay_until = (delay ? delay_date : null)
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
        /**
         * register the change to a set of entries to allow undoing it
         * throws an Error if the operation type is not known
         * @param type the type of change to register. This determines what undoing the change does. (CREATE->delete object,
         *              CHECKED->uncheck entry, UNCHECKED->check entry, DELAY->remove delay)
         * @param {{}} entries set of entries
         */
        registerChange(type, entries) {
            if (!['CREATED', 'CHECKED', 'UNCHECKED', 'DELAY', 'UNDELAY'].includes(type)) {
                throw Error('Tried to register unknown change type')
            }
            this.undo_stack.push({'type': type, 'entries': entries})
        },
        /**
         * takes the last item from the undo stack and reverts it
         */
        undoChange() {
            let last_item = this.undo_stack.pop()
            if (last_item !== undefined) {
                let type = last_item['type']
                let entries = last_item['entries']

                if (type === 'CHECKED' || type === 'UNCHECKED') {
                    this.setEntriesCheckedState(entries, (type === 'UNCHECKED'), false)
                } else if (type === 'DELAY' || type === 'UNDELAY') {
                    this.delayEntries(entries, (type === 'UNDELAY'), false)
                } else if (type === 'CREATED') {
                    for (let i in entries) {
                        let e = entries[i]
                        this.deleteObject(e)
                    }
                }
            } else {
                // can use localization in store
                //StandardToasts.makeStandardToast(this, this.$t('NoMoreUndo'))
            }
        }
    },
})
