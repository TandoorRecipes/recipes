import {acceptHMRUpdate, defineStore} from "pinia"
import {ApiApi, MealPlan, ShoppingListEntry, Supermarket, SupermarketCategory} from "@/openapi";
import {computed, ref} from "vue";
import {DateTime} from "luxon";
import _ from 'lodash';
import {IShoppingList, IShoppingListCategory, IShoppingListFood} from "@/types/Shopping";

const _STORE_ID = "shopping_store"
const UNDEFINED_CATEGORY = 'shopping_undefined_category'

enum GroupingOptions {
    GROUP_CATEGORY = 'food.supermarketCategory.name',
    GROUP_CREATED_BY = 'createdBy.displayName',
    GROUP_RECIPE = 'recipeMealplan.recipeName',
}

export const useShoppingStore = defineStore(_STORE_ID, () => {
    let entries = ref(new Map<number, ShoppingListEntry>)
    let supermarketCategories = ref([] as SupermarketCategory[])
    let supermarkets = ref([] as Supermarket[])

    // TODO move into special type for structure ?
    let total_unchecked = ref(0)
    let total_checked = ref(0)
    let total_unchecked_food = ref(0)
    let total_checked_food = ref(0)

    // internal
    let currentlyUpdating = ref(false)
    let lastAutosync = ref(0)
    let autosync_has_focus = ref(true)
    let autosync_timeout_id = ref(null) // TODO number?
    let undo_stack = ref([] as MealPlan[]) //TODO custom type for undo stack
    let queue_timeout_id = ref(null) // TODO number?
    let item_check_sync_queue = ref(null) // TODO custom type for check queue?


    /**
     * build a multi-level data structure ready for display from shopping list entries
     * group by selected grouping key
     * @return {{}}
     */
    const getEntriesByGroup = computed(() => {
        let structure = {} as IShoppingList
        structure.categories = new Map<number, IShoppingListCategory>

        let ordered_structure = []

        // build structure
        for (let i in entries.value.keys()) {

        }

        entries.value.forEach(shoppingListEntry => {
            structure = updateEntryInStructure(structure, shoppingListEntry, GroupingOptions.GROUP_CATEGORY) // TODO take category from device settings
        })


        // statistics for UI conditions and display
        let total_unchecked = 0
        let total_checked = 0
        let total_unchecked_food = 0
        let total_checked_food = 0

        // for (let i: number in structure.categories.keys()) {
        //     let count_unchecked = 0
        //     let count_checked = 0
        //     let count_unchecked_food = 0
        //     let count_checked_food = 0
        //
        //     for (let fi: number in structure.categories.get(i).foods.keys()) {
        //         let food_checked = true
        //         for (let ei in structure.categories.get(i).foods.get(fi).entries.key()) {
        //             if (structure[i]['foods'][fi]['entries'][ei].checked) {
        //                 count_checked++
        //             } else {
        //                 food_checked = false
        //                 count_unchecked++
        //             }
        //         }
        //         if (food_checked) {
        //             count_checked_food++
        //         } else {
        //             count_unchecked_food++
        //         }
        //     }
        //
        //     Vue.set(structure[i], 'count_unchecked', count_unchecked)
        //     Vue.set(structure[i], 'count_checked', count_checked)
        //     Vue.set(structure[i], 'count_unchecked_food', count_unchecked_food)
        //     Vue.set(structure[i], 'count_checked_food', count_checked_food)
        //
        //     total_unchecked += count_unchecked
        //     total_checked += count_checked
        //     total_unchecked_food += count_unchecked_food
        //     total_checked_food += count_checked_food
        // }
        //
        // this.total_unchecked = total_unchecked
        // this.total_checked = total_checked
        // this.total_unchecked_food = total_unchecked_food
        // this.total_checked_food = total_checked_food

        // ordering

        // if (UNDEFINED_CATEGORY in structure) {
        //     ordered_structure.push(structure[this.UNDEFINED_CATEGORY])
        //     Vue.delete(structure, this.UNDEFINED_CATEGORY)
        // }
        //
        // if (useUserPreferenceStore().device_settings.shopping_selected_grouping === this.GROUP_CATEGORY && useUserPreferenceStore().device_settings.shopping_selected_supermarket !== null) {
        //     for (let c of useUserPreferenceStore().device_settings.shopping_selected_supermarket.category_to_supermarket) {
        //         if (c.category.name in structure) {
        //             ordered_structure.push(structure[c.category.name])
        //             Vue.delete(structure, c.category.name)
        //         }
        //     }
        //     if (!useUserPreferenceStore().device_settings.shopping_show_selected_supermarket_only) {
        //         for (let i in structure) {
        //             ordered_structure.push(structure[i])
        //         }
        //     }
        // } else {
        //     for (let i in structure) {
        //         ordered_structure.push(structure[i])
        //     }
        // }

        return structure
    })

    /**
     * flattened list of entries used for exporters
     * kinda uncool but works for now
     * @return {*[]}
     */
    function getFlatEntries() {
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
    }

    /**
     * list of options available for grouping entry display
     * @return array of grouping options
     */
    function groupingOptions() {
        return [
            {'id': GroupingOptions.GROUP_CATEGORY, 'translationKey': 'Category'} as IGroupingOption,
            {'id': GroupingOptions.GROUP_CREATED_BY, 'translationKey': 'created_by'} as IGroupingOption,
            {'id': GroupingOptions.GROUP_RECIPE, 'translationKey': 'Recipe'} as IGroupingOption,
        ]
    }

    /**
     * checks if failed items are contained in the sync queue
     */
    function hasFailedItems() {
        for (let i in item_check_sync_queue.value) {
            if (item_check_sync_queue.value[i]['status'] === 'syncing_failed_before' || item_check_sync_queue.value[i]['status'] === 'waiting_failed_before') {
                return true
            }
        }
        return false
    }

    //TODO fix/verify for typescript
    /**
     * Retrieves all shopping related data (shopping list entries, supermarkets, supermarket categories and shopping list recipes) from API
     */
    function refreshFromAPI() {
        if (!currentlyUpdating.value) {
            currentlyUpdating.value = true
            lastAutosync.value = new Date().getTime();

            let api = new ApiApi()
            api.apiShoppingListEntryList().then((r) => {
                entries.value = new Map<number, ShoppingListEntry>

                r.forEach((e) => {
                    entries.value.set(e.id, e)
                })
                currentlyUpdating.value = false
            }).catch((err) => {
                currentlyUpdating.value = false
                // TODO add message to log
            })

            api.apiSupermarketList().then(r => {
                supermarketCategories.value = r
            }).catch((err) => {
                // TODO add message to log
            })

            api.apiSupermarketList().then(r => {
                supermarkets.value = r
            }).catch((err) => {
                // TODO add message to log
            })
        }
    }

//TODO fix/verify for typescript
    /**
     * perform auto sync request to special endpoint returning only entries changed since last auto sync
     * only updates local entries that are older than the server version
     */
    function autosync() {
        if (!this.currently_updating && this.autosync_has_focus) {
            console.log('running autosync')

            this.currently_updating = true

            let previous_autosync = this.lastAutosync
            this.lastAutosync = new Date().getTime();

            const api = new ApiApi()
            // TODO query parameters
            api.listShoppingListEntrys({lastAutosync: previous_autosync}).then((r) => {
                r.forEach((e) => {
                    // dont update stale client data
                    if (!(Object.keys(this.entries).includes(e.id.toString())) || Date.parse(this.entries[e.id].updated_at) < Date.parse(e.updated_at)) {
                        console.log('auto sync updating entry ', e)
                        this.entries[e.id] = e
                    }
                })
                this.currently_updating = false
            }).catch((err) => {
                console.warn('auto sync failed')
                this.currently_updating = false
            })
        }
    }

//TODO fix/verify for typescript
    /**
     * Create a new shopping list entry
     * adds new entry to store
     * @param object entry object to create
     * @return {Promise<T | void>} promise of creation call to subscribe to
     */
    function createObject(object) {
        const api = new ApiApi()
        return api.createShoppingListEntry(object).then((r) => {
            this.entries[r.id] = r
        }).catch((err) => {
            // StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
        })
    }

//TODO fix/verify for typescript
    /**
     * update existing entry object and updated_at timestamp
     * updates data in store
     * IMPORTANT: always use this method to update objects to keep client state consistent
     * @param object entry object to update
     * @return {Promise<T | void>} promise of updating call to subscribe to
     */
    function updateObject(object) {
        const api = new ApiApi()
        // sets the update_at timestamp on the client to prevent auto sync from overriding with older changes
        // moment().format() yields locale aware datetime without ms 2024-01-04T13:39:08.607238+01:00
        //Vue.set(object, 'updated_at', moment().format())
        object['update_at'] = DateTime.toLocaleString() // TODO check formats

        return api.updateShoppingListEntry(object.id, object).then((r) => {
            this.entries[r.id] = r
        }).catch((err) => {
            // StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
        })
    }

//TODO fix/verify for typescript
    /**
     * delete shopping list entry object from DB and store
     * @param object entry object to delete
     * @return {Promise<T | void>} promise of delete call to subscribe to
     */
    function deleteObject(object) {
        const api = new ApiApi()
        return api.destroyShoppingListEntry({id: object.id}).then((r) => {
            delete this.entries[object.id]
        }).catch((err) => {
            // StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
        })
    }

//TODO fix/verify for typescript
    /**
     * returns a distinct list of recipes associated with unchecked shopping list entries
     */
    function getAssociatedRecipes() {
        let recipes = {} // TODO this needs a type

        for (let i in this.entries) {
            let e = this.entries[i]
            if (e.recipe_mealplan !== null) {
                recipes[e.recipe_mealplan.recipe] = {
                    'shopping_list_recipe_id': e.list_recipe,
                    'recipe_id': e.recipe_mealplan.recipe,
                    'recipe_name': e.recipe_mealplan.recipe_name,
                    'servings': e.recipe_mealplan.servings,
                    'mealplan_from_date': e.recipe_mealplan.mealplan_from_date,
                    'mealplan_type': e.recipe_mealplan.mealplan_type,
                }
            }
        }

        return recipes
    }

    // convenience methods
    //TODO fix/verify for typescript
    /**
     * function to set entry to its proper place in the data structure to perform grouping
     * @param {{}} structure datastructure
     * @param {*} entry entry to place
     * @param {*} group group to place entry into (must be of ShoppingListStore.GROUP_XXX/dot notation of entry property)
     * @returns {{}} datastructure including entry
     */
    function updateEntryInStructure(structure: IShoppingList, entry: ShoppingListEntry, group: GroupingOptions) {
        let grouping_key = _.get(entry, group, UNDEFINED_CATEGORY)

        if (grouping_key === undefined || grouping_key === null) {
            grouping_key = UNDEFINED_CATEGORY
        }

        if (!structure.categories.has(grouping_key)) {
            structure.categories.set(grouping_key, {'name': grouping_key, 'foods': new Map<number, IShoppingListFood>} as IShoppingListCategory)
        }
        if (!structure.categories.get(grouping_key).foods.has(entry.food.id)) {
            structure.categories.get(grouping_key).foods.set(entry.food.id, {
                food: entry.food,
                entries: new Map<number, ShoppingListEntry>
            } as IShoppingListFood)
        }
        structure.categories.get(grouping_key).foods.get(entry.food.id).entries.set(entry.id, entry)
        return structure
    }

//TODO fix/verify for typescript
    /**
     * function to handle user checking or unchecking a set of entries
     * @param {{}} entries set of entries
     * @param checked boolean to set checked state of entry to
     * @param undo if the user should be able to undo the change or not
     */
    function setEntriesCheckedState(entries, checked, undo) {
        if (undo) {
            this.registerChange((checked ? 'CHECKED' : 'UNCHECKED'), entries)
        }

        let entry_id_list = []
        for (let i in entries) {
            this.entries[i]['checked'] = checked
            this.entries[i]['updated_at'] = DateTime.now().toISOTime() // TODO was moment.format() (see above)
            entry_id_list.push(i)
        }

        this.item_check_sync_queue[Math.random()] = {
            'ids': entry_id_list,
            'checked': checked,
            'status': 'waiting'
        }
        this.runSyncQueue(5)
    }

//TODO fix/verify for typescript
    /**
     * go through the list of queued requests and try to run them
     * add request back to queue if it fails due to offline or timeout
     * Do NOT call this method directly, always call using runSyncQueue method to prevent simultaneous runs
     * @private
     */
    function _replaySyncQueue() {
        if (navigator.onLine || document.location.href.includes('localhost')) {
            let api = new ApiApi()
            let promises = []

            for (let i in this.item_check_sync_queue) {
                let entry = this.item_check_sync_queue[i]
                entry['status'] = ((entry['status'] === 'waiting') ? 'syncing' : 'syncing_failed_before')
                this.item_check_sync_queue[i] = entry

                // TODO request params
                let p = api.bulkShoppingListEntry(entry, {timeout: 15000}).then((r) => {
                    delete this.item_check_sync_queue[i]
                }).catch((err) => {
                    if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED") {
                        entry['status'] = 'waiting_failed_before'
                        this.item_check_sync_queue[i] = entry
                    } else {
                        delete this.item_check_sync_queue[i]
                        console.error('Failed API call for entry ', entry)
                        // StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
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
    }

//TODO fix/verify for typescript
    /**
     * manages running the replaySyncQueue function after the given timeout
     * calling this function might cancel a previously created timeout
     * @param timeout time in ms after which to run the replaySyncQueue function
     */
    function runSyncQueue(timeout) {
        clearTimeout(this.queue_timeout_id)

        this.queue_timeout_id = setTimeout(() => {
            this._replaySyncQueue()
        }, timeout)
    }

//TODO fix/verify for typescript
    /**
     * function to handle user "delaying" and "undelaying" shopping entries
     * @param {{}} entries set of entries
     * @param delay if entries should be delayed or if delay should be removed
     * @param undo if the user should be able to undo the change or not
     */
    function delayEntries(entries, delay, undo) {
        let delay_hours = useUserPreferenceStore().user_settings.default_delay
        let delay_date = new Date(Date.now() + delay_hours * (60 * 60 * 1000))

        if (undo) {
            this.registerChange((delay ? 'DELAY' : 'UNDELAY'), entries)
        }

        for (let i in entries) {
            this.entries[i].delay_until = (delay ? delay_date : null)
            this.updateObject(this.entries[i])
        }
    }

//TODO fix/verify for typescript
    /**
     * delete list of entries
     * @param {{}} entries set of entries
     */
    function deleteEntries(entries) {
        for (let i in entries) {
            this.deleteObject(this.entries[i])
        }
    }

//TODO fix/verify for typescript
    function deleteShoppingListRecipe(shopping_list_recipe_id) {
        const api = new ApiApi()

        for (let i in this.entries) {
            if (this.entries[i].list_recipe === shopping_list_recipe_id) {
                delete this.entries[i]
            }
        }

        api.destroyShoppingListRecipe(shopping_list_recipe_id).then((x) => {
            // no need to update anything, entries were already removed
        }).catch((err) => {
            // StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
        })
    }

//TODO fix/verify for typescript
    /**
     * register the change to a set of entries to allow undoing it
     * throws an Error if the operation type is not known
     * @param type the type of change to register. This determines what undoing the change does. (CREATE->delete object,
     *              CHECKED->uncheck entry, UNCHECKED->check entry, DELAY->remove delay)
     * @param {{}} entries set of entries
     */
    function registerChange(type, entries) {
        if (!['CREATED', 'CHECKED', 'UNCHECKED', 'DELAY', 'UNDELAY'].includes(type)) {
            throw Error('Tried to register unknown change type')
        }
        this.undo_stack.push({'type': type, 'entries': entries})
    }

//TODO fix/verify for typescript
    /**
     * takes the last item from the undo stack and reverts it
     */
    function undoChange() {
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


    return {entries, supermarkets, supermarketCategories, getEntriesByGroup, getFlatEntries, groupingOptions, hasFailedItems, refreshFromAPI}

})

// enable hot reload for store
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useShoppingStore, import.meta.hot))
}