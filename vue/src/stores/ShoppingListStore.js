import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {ApiApiFactory} from "@/utils/openapi/api";
import {StandardToasts} from "@/utils/utils";
import _ from 'lodash';
import moment from "moment/moment";
import {defineStore} from "pinia";
import Vue from "vue";

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

        total_unchecked: 0,
        total_checked: 0,
        total_unchecked_food: 0,
        total_checked_food: 0,

        // internal
        currently_updating: false,
        last_autosync: null,
        autosync_has_focus: true,
        autosync_timeout_id: null,
        undo_stack: [],

        queue_timeout_id: undefined,
        item_check_sync_queue: {},

        // constants
        GROUP_CATEGORY: 'food.supermarket_category.name',
        GROUP_CREATED_BY: 'created_by.display_name',
        GROUP_RECIPE: 'recipe_mealplan.recipe_name',

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
                let count_delayed_unchecked = 0

                for (let fi in structure[i]['foods']) {
                    let food_checked = true
                    for (let ei in structure[i]['foods'][fi]['entries']) {
                        if (structure[i]['foods'][fi]['entries'][ei].checked) {
                            count_checked++
                        } else {
                            food_checked = false
                            count_unchecked++
                            if (this.is_delayed(structure[i]['foods'][fi]['entries'][ei])){
                                count_delayed_unchecked++
                            }
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
                Vue.set(structure[i], 'count_delayed_unchecked', count_delayed_unchecked)

                total_unchecked += count_unchecked
                total_checked += count_checked
                total_unchecked_food += count_unchecked_food
                total_checked_food += count_checked_food
            }

            this.total_unchecked = total_unchecked
            this.total_checked = total_checked
            this.total_unchecked_food = total_unchecked_food
            this.total_checked_food = total_checked_food

            // ordering
            if (this.UNDEFINED_CATEGORY in structure) {
                ordered_structure.push(structure[this.UNDEFINED_CATEGORY])
                Vue.delete(structure, this.UNDEFINED_CATEGORY)
            }

            if (useUserPreferenceStore().device_settings.shopping_selected_grouping === this.GROUP_CATEGORY && useUserPreferenceStore().device_settings.shopping_selected_supermarket !== null) {
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
         * flattened list of entries used for exporters
         * kinda uncool but works for now
         * @return {*[]}
         */
        get_flat_entries: function () {
            let items = []
            for (let i in this.get_entries_by_group) {
                for (let f in this.get_entries_by_group[i]['foods']) {
                    for (let e in this.get_entries_by_group[i]['foods'][f]['entries']) {
                        items.push({
                            amount: this.get_entries_by_group[i]['foods'][f]['entries'][e].amount,
                            unit: this.get_entries_by_group[i]['foods'][f]['entries'][e].unit?.name ?? '',
                            food: this.get_entries_by_group[i]['foods'][f]['entries'][e].food?.name ?? '',
                        })
                    }
                }
            }
            return items
        },
        /**
         * list of options available for grouping entry display
         * @return {[{id: *, translatable_label: string},{id: *, translatable_label: string},{id: *, translatable_label: string}]}
         */
        grouping_options: function () {
            return [
                {'id': this.GROUP_CATEGORY, 'translatable_label': 'Category'},
                {'id': this.GROUP_CREATED_BY, 'translatable_label': 'created_by'},
                {'id': this.GROUP_RECIPE, 'translatable_label': 'Recipe'}
            ]
        },
        /**
         * checks if failed items are contained in the sync queue
         */
        has_failed_items: function () {
            for (let i in this.item_check_sync_queue) {
                if (this.item_check_sync_queue[i]['status'] === 'syncing_failed_before' || this.item_check_sync_queue[i]['status'] === 'waiting_failed_before') {
                    return true
                }
            }
            return false
        },
        
    },
    actions: {
        /**
         * Retrieves all shopping related data (shopping list entries, supermarkets, supermarket categories and shopping list recipes) from API
         */
        refreshFromAPI() {
            if (!this.currently_updating) {
                this.currently_updating = true
                this.last_autosync = new Date().getTime();

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
        /**
         * perform auto sync request to special endpoint returning only entries changed since last auto sync
         * only updates local entries that are older than the server version
         */
        autosync() {
            if (!this.currently_updating && this.autosync_has_focus) {
                console.log('running autosync')

                this.currently_updating = true

                let previous_autosync = this.last_autosync
                this.last_autosync = new Date().getTime();

                let apiClient = new ApiApiFactory()
                apiClient.listShoppingListEntrys(undefined, undefined, undefined, {'query': {'last_autosync': previous_autosync}
                }).then((r) => {
                    r.data.forEach((e) => {
                        // dont update stale client data
                        if (!(Object.keys(this.entries).includes(e.id.toString())) || Date.parse(this.entries[e.id].updated_at) < Date.parse(e.updated_at)) {
                            console.log('auto sync updating entry ', e)
                            Vue.set(this.entries, e.id, e)
                        }
                    })
                    this.currently_updating = false
                }).catch((err) => {
                    console.warn('auto sync failed')
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
            Vue.set(object, 'updated_at', moment().format())

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
                        'servings': e.recipe_mealplan.servings,
                        'mealplan_from_date': e.recipe_mealplan.mealplan_from_date,
                        'mealplan_type': e.recipe_mealplan.mealplan_type,
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
                Vue.set(this.entries[i], 'updated_at', moment().format())
                entry_id_list.push(i)
            }

            this.item_check_sync_queue
            Vue.set(this.item_check_sync_queue, Math.random(), {
                'ids': entry_id_list,
                'checked': checked,
                'status': 'waiting'
            })
            this.runSyncQueue(5)
        },
        /**
         * go through the list of queued requests and try to run them
         * add request back to queue if it fails due to offline or timeout
         * Do NOT call this method directly, always call using runSyncQueue method to prevent simultaneous runs
         * @private
         */
        _replaySyncQueue() {
            if (navigator.onLine || document.location.href.includes('localhost')) {
                let apiClient = new ApiApiFactory()
                let promises = []

                for (let i in this.item_check_sync_queue) {
                    let entry = this.item_check_sync_queue[i]
                    Vue.set(entry, 'status', ((entry['status'] === 'waiting') ? 'syncing' : 'syncing_failed_before'))
                    Vue.set(this.item_check_sync_queue, i, entry)

                    let p = apiClient.bulkShoppingListEntry(entry, {timeout: 15000}).then((r) => {
                        Vue.delete(this.item_check_sync_queue, i)
                    }).catch((err) => {
                        if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED") {
                            Vue.set(entry, 'status', 'waiting_failed_before')
                            Vue.set(this.item_check_sync_queue, i, entry)
                        } else {
                            Vue.delete(this.item_check_sync_queue, i)
                            console.error('Failed API call for entry ', entry)
                            StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                        }
                    })
                    promises.push(p)
                }

                Promise.allSettled(promises).finally(r => {
                    this.runSyncQueue(500)
                })
            } else {
                this.runSyncQueue(5000)
            }
        },
        /**
         * manages running the replaySyncQueue function after the given timeout
         * calling this function might cancel a previously created timeout
         * @param timeout time in ms after which to run the replaySyncQueue function
         */
        runSyncQueue(timeout) {
            clearTimeout(this.queue_timeout_id)

            this.queue_timeout_id = setTimeout(() => {
                this._replaySyncQueue()
            }, timeout)
        },
        /**
         * function to handle user "delaying" and "undelaying" shopping entries
         * @param {{}} entries set of entries
         * @param delay if entries should be delayed or if delay should be removed
         * @param undo if the user should be able to undo the change or not
         */
        delayEntries(entries, delay, undo) {
            let delay_hours = useUserPreferenceStore().user_settings.default_delay
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
        deleteShoppingListRecipe(shopping_list_recipe_id) {
            let api = new ApiApiFactory()

            for (let i in this.entries) {
                if (this.entries[i].list_recipe === shopping_list_recipe_id) {
                    Vue.delete(this.entries, i)
                }
            }

            api.destroyShoppingListRecipe(shopping_list_recipe_id).then((x) => {
                // no need to update anything, entries were already removed
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
            })
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
        },
        /**
         * checks if the delay_until is in the future.  If it is, the item is delayed
         */
        is_delayed: function(entry) {
            let delayed = false
            if (entry.delay_until != null) {
                const delay_until = new Date(entry.delay_until)
                delayed = delay_until.getTime() > Date.now()
            }
            return delayed
        }
    },
})
