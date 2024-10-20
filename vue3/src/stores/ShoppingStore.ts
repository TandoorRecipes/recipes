import {acceptHMRUpdate, defineStore} from "pinia"
import {ApiApi, ShoppingListEntry, Supermarket, SupermarketCategory} from "@/openapi";
import {computed, ref} from "vue";
import {
    IShoppingExportEntry,
    IShoppingList,
    IShoppingListCategory,
    IShoppingListFood,
    IShoppingSyncQueueEntry,
    ShoppingGroupingOptions, ShoppingListStats,
    ShoppingOperationHistoryEntry,
    ShoppingOperationHistoryType
} from "@/types/Shopping";
import {ErrorMessageType, MessageType, useMessageStore} from "@/stores/MessageStore";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";

const _STORE_ID = "shopping_store"
const UNDEFINED_CATEGORY = 'shopping_undefined_category'

export const useShoppingStore = defineStore(_STORE_ID, () => {
    let entries = ref(new Map<number, ShoppingListEntry>)
    let supermarketCategories = ref([] as SupermarketCategory[])
    let supermarkets = ref([] as Supermarket[])

    let stats = ref({
        countChecked: 0,
        countUnchecked: 0,
        countCheckedFood: 0,
        countUncheckedFood: 0,
        countUncheckedDelayed: 0,
    } as ShoppingListStats)

    // internal
    let currentlyUpdating = ref(false)
    let lastAutosync = ref(0)
    let autosyncHasFocus = ref(true)
    let undoStack = ref([] as ShoppingOperationHistoryEntry[])
    let queueTimeoutId = ref(-1)
    let itemCheckSyncQueue = ref([] as IShoppingSyncQueueEntry[])


    /**
     * build a multi-level data structure ready for display from shopping list entries
     * group by selected grouping key
     */
    const getEntriesByGroup = computed(() => {
        let structure = {} as IShoppingList
        structure.categories = new Map<string, IShoppingListCategory>

        let orderedStructure = [] as IShoppingListCategory[]

        // build structure
        entries.value.forEach(shoppingListEntry => {
            structure = updateEntryInStructure(structure, shoppingListEntry, useUserPreferenceStore().deviceSettings.shopping_selected_grouping)
        })

        // statistics for UI conditions and display
        structure.categories.forEach(category => {
            let categoryStats = {
                countChecked: 0,
                countUnchecked: 0,
                countCheckedFood: 0,
                countUncheckedFood: 0,
                countUncheckedDelayed: 0,
            } as ShoppingListStats

            category.foods.forEach(food => {
                let food_checked = true

                food.entries.forEach(entry => {
                    if (entry.checked) {
                        categoryStats.countChecked++
                    } else {
                        categoryStats.countUnchecked++
                        if(entry.delayUntil != null) {
                            categoryStats.countUncheckedDelayed++
                        }
                    }
                })

                if (food_checked) {
                    categoryStats.countCheckedFood++
                } else {
                    categoryStats.countUncheckedFood++
                }
            })
            category.stats = categoryStats

            stats.value.countChecked += categoryStats.countChecked
            stats.value.countUnchecked += categoryStats.countUnchecked
            stats.value.countCheckedFood += categoryStats.countCheckedFood
            stats.value.countUncheckedFood += categoryStats.countUncheckedFood
        })

        // ordering

        if (structure.categories.has(UNDEFINED_CATEGORY)) {
            orderedStructure.push(structure.categories.get(UNDEFINED_CATEGORY))
            structure.categories.delete(UNDEFINED_CATEGORY)
        }

        structure.categories.forEach(category => {
            orderedStructure.push(category)
        })

        // TODO implement ordering
        // if (useUserPreferenceStore().device_settings.shopping_selected_grouping === this.GROUP_CATEGORY && 'useUserPreferenceStore().device_settings.shopping_selected_supermarket' !== null) {
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

        return orderedStructure
    })

    /**
     * flattened list of entries used for exporters
     * kinda uncool but works for now
     * @return IShoppingExportEntry[]
     */
    function getFlatEntries() {
        let items: IShoppingExportEntry[] = []

        getEntriesByGroup.value.forEach(shoppingListEntry => {
            shoppingListEntry.foods.forEach(food => {
                food.entries.forEach(entry => {
                    items.push({
                        amount: entry.amount,
                        unit: entry.unit?.name ?? '',
                        food: entry.food?.name ?? '',
                    })
                })
            })
        })

        return items
    }

    /**
     * checks if failed items are contained in the sync queue
     */
    function hasFailedItems() {
        for (let i in itemCheckSyncQueue.value) {
            if (itemCheckSyncQueue.value[i]['status'] === 'syncing_failed_before' || itemCheckSyncQueue.value[i]['status'] === 'waiting_failed_before') {
                return true
            }
        }
        return false
    }

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
                // TODO load all pages
                r.results.forEach((e) => {
                    entries.value.set(e.id!, e)
                })
                currentlyUpdating.value = false
            }).catch((err) => {
                currentlyUpdating.value = false
                useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
            })

            api.apiSupermarketList().then(r => {
                supermarketCategories.value = r.results
            }).catch((err) => {
                useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
            })

            api.apiSupermarketList().then(r => {
                supermarkets.value = r.results
            }).catch((err) => {
                useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
            })
        }
    }

    /**
     * perform auto sync request to special endpoint returning only entries changed since last auto sync
     * only updates local entries that are older than the server version
     */
    function autosync() {
        if (!currentlyUpdating.value && autosyncHasFocus.value) {
            console.log('running autosync')

            currentlyUpdating.value = true

            let previous_autosync = lastAutosync.value
            lastAutosync.value = new Date().getTime();

            const api = new ApiApi()
            // TODO implement parameters on backend Oepnapi
            api.apiShoppingListEntryList({lastAutosync: previous_autosync}).then((r) => {
                r.results.forEach((e) => {
                    // dont update stale client data
                    if (!entries.value.has(e.id!) || entries.value.get(e.id!).updatedAt < e.updatedAt) {
                        console.log('auto sync updating entry ', e)
                        entries.value.set(e.id!, e)
                    }
                })
                currentlyUpdating.value = false
            }).catch((err: any) => {
                console.warn('auto sync failed')
                currentlyUpdating.value = false
            })
        }
    }

    /**
     * Create a new shopping list entry
     * adds new entry to store
     * @param object entry object to create
     * @return {Promise<ShoppingListEntry>} promise of creation call to subscribe to
     */
    function createObject(object: ShoppingListEntry) {
        const api = new ApiApi()
        return api.apiShoppingListEntryCreate({shoppingListEntry: object}).then((r) => {
            entries.value.set(r.id!, r)
        }).catch((err) => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
        })
    }

    /**
     * update existing entry object and updated_at timestamp
     * updates data in store
     * IMPORTANT: always use this method to update objects to keep client state consistent
     * @param object entry object to update
     * @return {Promise<ShoppingListEntry>} promise of updating call to subscribe to
     */
    function updateObject(object: ShoppingListEntry) {
        const api = new ApiApi()
        // sets the update_at timestamp on the client to prevent auto sync from overriding with older changes
        // moment().format() yields locale aware datetime without ms 2024-01-04T13:39:08.607238+01:00
        //Vue.set(object, 'updated_at', moment().format())
        // object.updatedAt = DateTime.toLocaleString()
        // TODO setting timestamp on the client does not make sense because client and server clock might be out of sync and field will be overridden by server anyway

        return api.apiShoppingListEntryUpdate({id: object.id!, shoppingListEntry: object}).then((r) => {
            entries.value.set(r.id!, r)
        }).catch((err) => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        })
    }

    /**
     * delete shopping list entry object from DB and store
     * @param object entry object to delete
     * @return {Promise<ShoppingListEntry>} promise of delete call to subscribe to
     */
    function deleteObject(object: ShoppingListEntry) {
        const api = new ApiApi()
        return api.apiShoppingListEntryDestroy({id: object.id!}).then((r) => {
            entries.value.delete(object.id!)
        }).catch((err) => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
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
    /**
     * function to set entry to its proper place in the data structure to perform grouping
     * @param {{}} structure datastructure
     * @param {*} entry entry to place
     * @param {*} group group to place entry into (must be of ShoppingListStore.GROUP_XXX/dot notation of entry property)
     * @returns {{}} datastructure including entry
     */
    function updateEntryInStructure(structure: IShoppingList, entry: ShoppingListEntry, group: ShoppingGroupingOptions) {
        let groupingKey = UNDEFINED_CATEGORY

        if (group == ShoppingGroupingOptions.CATEGORY && entry.food != null && entry.food.supermarketCategory != null) {
            groupingKey = entry.food?.supermarketCategory?.name
        } else if (group == ShoppingGroupingOptions.CREATED_BY) {
            groupingKey = entry.createdBy.displayName
        } else if (group == ShoppingGroupingOptions.RECIPE && entry.recipeMealplan != null) {
            groupingKey = entry.recipeMealplan.recipeName
        }

        if (!structure.categories.has(groupingKey)) {
            structure.categories.set(groupingKey, {'name': groupingKey, 'foods': new Map<number, IShoppingListFood>} as IShoppingListCategory)
        }
        if (!structure.categories.get(groupingKey).foods.has(entry.food.id)) {
            structure.categories.get(groupingKey).foods.set(entry.food.id, {
                food: entry.food,
                entries: new Map<number, ShoppingListEntry>
            } as IShoppingListFood)
        }
        structure.categories.get(groupingKey).foods.get(entry.food.id).entries.set(entry.id, entry)
        return structure
    }

    /**
     * function to handle user checking or unchecking a set of entries
     * @param {{}} entries set of entries
     * @param checked boolean to set checked state of entry to
     * @param undo if the user should be able to undo the change or not
     */
    function setEntriesCheckedState(entries: ShoppingListEntry[], checked: boolean, undo: boolean) {
        if (undo) {
            registerChange((checked ? 'CHECKED' : 'UNCHECKED'), entries)
        }

        let entryIdList: number[] = []
        entries.forEach(entry => {
            entry.checked = checked
            // TODO used to set updatedAt but does not make sense on client, rethink solution (as above)
            entryIdList.push(entry.id!)
        })

        itemCheckSyncQueue.value.push({
            ids: entryIdList,
            checked: checked,
            status: 'waiting',
        } as IShoppingSyncQueueEntry)
        runSyncQueue(5)
    }

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

            for (let i in itemCheckSyncQueue.value) {
                let entry = itemCheckSyncQueue.value[i]
                entry['status'] = ((entry['status'] === 'waiting') ? 'syncing' : 'syncing_failed_before')
                itemCheckSyncQueue.value[i] = entry

                // TODO set timeout for request (previously was 15000ms) or check that default timeout is similar
                let p = api.apiShoppingListEntryBulkCreate({shoppingListEntryBulk: entry}, {}).then((r) => {
                    delete itemCheckSyncQueue.value[i]
                }).catch((err) => {
                    if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED") {
                        entry['status'] = 'waiting_failed_before'
                        itemCheckSyncQueue.value[i] = entry
                    } else {
                        delete itemCheckSyncQueue.value[i]
                        console.error('Failed API call for entry ', entry)
                        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
                    }
                })
                promises.push(p)
            }

            Promise.allSettled(promises).finally(() => {
                runSyncQueue(500)
            })
        } else {
            runSyncQueue(5000)
        }
    }

    /**
     * manages running the replaySyncQueue function after the given timeout
     * calling this function might cancel a previously created timeout
     * @param timeout time in ms after which to run the replaySyncQueue function
     */
    function runSyncQueue(timeout: number) {
        clearTimeout(queueTimeoutId.value)

        queueTimeoutId.value = window.setTimeout(() => {
            _replaySyncQueue()
        }, timeout)
    }

    /**
     * function to handle user "delaying" and "undelaying" shopping entries
     * @param {{}} entries set of entries
     * @param delay if entries should be delayed or if delay should be removed
     * @param undo if the user should be able to undo the change or not
     */
    function delayEntries(entries: ShoppingListEntry[], delay: boolean, undo: boolean) {
        let delay_hours = useUserPreferenceStore().userSettings.defaultDelay!
        let delayDate = new Date(Date.now() + delay_hours * (60 * 60 * 1000))

        if (undo) {
            registerChange((delay ? 'DELAY' : 'UNDELAY'), entries)
        }

        for (let i in entries) {
            entries[i].delayUntil = (delay ? delayDate : null)
            updateObject(entries[i])
        }
    }

    /**
     * delete list of entries
     * @param {{}} entries set of entries
     */
    function deleteEntries(entries: ShoppingListEntry[]) {
        entries.forEach((entry) => {
            deleteObject(entry)
        })
    }

    function deleteShoppingListRecipe(shopping_list_recipe_id: number) {
        const api = new ApiApi()

        entries.value.forEach(entry => {
            if (entry.listRecipe == shopping_list_recipe_id) {
                entries.value.delete(entry.id!)
            }
        })

        api.apiShoppingListRecipeDestroy({id: shopping_list_recipe_id}).then((x) => {
            // no need to update anything, entries were already removed
        }).catch((err) => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        })
    }


    /**
     * register the change to a set of entries to allow undoing it
     * throws an Error if the operation type is not known
     * @param type the type of change to register. This determines what undoing the change does. (CREATE->delete object,
     *              CHECKED->uncheck entry, UNCHECKED->check entry, DELAY->remove delay)
     * @param {{}} entries set of entries
     */
    function registerChange(type: ShoppingOperationHistoryType, entries: ShoppingListEntry[]) {
        undoStack.value.push({'type': type, 'entries': entries} as ShoppingOperationHistoryEntry)
    }

    /**
     * takes the last item from the undo stack and reverts it
     */
    function undoChange() {
        let last_item = undoStack.value.pop()
        if (last_item !== undefined) {
            let type = last_item['type']
            let entries = last_item['entries']

            if (type === 'CHECKED' || type === 'UNCHECKED') {
                setEntriesCheckedState(entries, (type === 'UNCHECKED'), false)
            } else if (type === 'DELAY' || type === 'UNDELAY') {
                delayEntries(entries, (type === 'UNDELAY'), false)
            } else if (type === 'CREATED') {
                for (let i in entries) {
                    let e = entries[i]
                    deleteObject(e)
                }
            }
        } else {
            // can use localization in store
            //StandardToasts.makeStandardToast(this, this.$t('NoMoreUndo'))
        }
    }

    return {
        UNDEFINED_CATEGORY,
        entries,
        supermarkets,
        supermarketCategories,
        getEntriesByGroup,
        getFlatEntries,
        hasFailedItems,
        refreshFromAPI,
        createObject,
        deleteObject,
        updateObject,
        undoChange,
        setEntriesCheckedState,
        delayEntries,

    }
})

// enable hot reload for store
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useShoppingStore, import.meta.hot))
}