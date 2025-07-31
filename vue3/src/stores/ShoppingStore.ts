import {acceptHMRUpdate, defineStore} from "pinia"
import {ApiApi, ApiShoppingListEntryListRequest, Food, Recipe, ShoppingListEntry, ShoppingListEntryBulk, ShoppingListRecipe, Supermarket, SupermarketCategory} from "@/openapi";
import {computed, ref} from "vue";
import {
    IShoppingExportEntry,
    IShoppingList,
    IShoppingListCategory,
    IShoppingListFood,
    IShoppingSyncQueueEntry,
    ShoppingGroupingOptions,
    ShoppingListStats,
    ShoppingOperationHistoryEntry,
    ShoppingOperationHistoryType
} from "@/types/Shopping";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {isDelayed, isEntryVisible} from "@/utils/logic_utils";
import {DateTime} from "luxon";

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
    let initialized = ref(false)

    let autoSyncLastTimestamp = ref(new Date('1970-01-01'))
    let autoSyncHasFocus = ref(true)
    let autoSyncTimeoutId = ref(0)

    let undoStack = ref([] as ShoppingOperationHistoryEntry[])
    let queueTimeoutId = ref(-1)
    let itemCheckSyncQueue = ref([] as IShoppingSyncQueueEntry[])

    /**
     * build a multi-level data structure ready for display from shopping list entries
     * group by selected grouping key
     */
    const getEntriesByGroup = computed(() => {
        stats.value = {
            countChecked: 0,
            countUnchecked: 0,
            countCheckedFood: 0,
            countUncheckedFood: 0,
            countUncheckedDelayed: 0,
        } as ShoppingListStats

        let structure = {} as IShoppingList
        structure.categories = new Map<string, IShoppingListCategory>

        if (useUserPreferenceStore().deviceSettings.shopping_selected_grouping === ShoppingGroupingOptions.CATEGORY && useUserPreferenceStore().deviceSettings.shopping_selected_supermarket != null) {
            useUserPreferenceStore().deviceSettings.shopping_selected_supermarket.categoryToSupermarket.forEach(cTS => {
                structure.categories.set(cTS.category.name, {'name': cTS.category.name, 'foods': new Map<number, IShoppingListFood>} as IShoppingListCategory)
            })
        }

        let orderedStructure = [] as IShoppingListCategory[]

        // build structure
        entries.value.forEach(shoppingListEntry => {
            structure = updateEntryInStructure(structure, shoppingListEntry)
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
                        if (isDelayed(entry)) {
                            categoryStats.countUncheckedDelayed++
                        } else {
                            categoryStats.countUnchecked++
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
        let undefinedCategoryGroup = structure.categories.get(UNDEFINED_CATEGORY)
        if (undefinedCategoryGroup != null) {
            orderedStructure.push(undefinedCategoryGroup)
            structure.categories.delete(UNDEFINED_CATEGORY)
        }

        structure.categories.forEach(category => {
            orderedStructure.push(category)
        })

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
     * very simple list of shopping list entries as IShoppingListFood array filtered by a certain mealplan
     * @param mealPlanId ID of mealplan
     */
    function getMealPlanEntries(mealPlanId: number) {
        let items: IShoppingListFood[] = []

        entries.value.forEach(shoppingListEntry => {
            if (shoppingListEntry.listRecipe && shoppingListEntry.listRecipeData.mealplan == mealPlanId) {
                items.push({
                    food: shoppingListEntry.food,
                    entries: new Map<number, ShoppingListEntry>().set(shoppingListEntry.id!, shoppingListEntry)
                } as IShoppingListFood)
            }
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
     * @param mealPlanId optionally filter by mealplan ID and only load entries associated with that
     */
    function refreshFromAPI(mealPlanId?: number) {
        if (!currentlyUpdating.value) {
            currentlyUpdating.value = true
            autoSyncLastTimestamp.value = new Date();

            let api = new ApiApi()
            let requestParameters = {pageSize: 50, page: 1} as ApiShoppingListEntryListRequest
            if (mealPlanId) {
                requestParameters.mealplan = mealPlanId
            } else {
                // only clear local entries when not given a meal plan to not accidentally filter the shopping list
                entries.value = new Map<number, ShoppingListEntry>
            }

            recLoadShoppingListEntries(requestParameters)

            api.apiSupermarketCategoryList().then(r => {
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
     * recursively load shopping list entries from paginated api
     * @param requestParameters
     */
    function recLoadShoppingListEntries(requestParameters: ApiShoppingListEntryListRequest) {
        let api = new ApiApi()
        api.apiShoppingListEntryList(requestParameters).then((r) => {
            r.results.forEach((e) => {
                entries.value.set(e.id!, e)
            })
            if (r.next) {
                requestParameters.page = requestParameters.page + 1
                recLoadShoppingListEntries(requestParameters)
            } else {
                currentlyUpdating.value = false
                initialized.value = true
            }
        }).catch((err) => {
            currentlyUpdating.value = false
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        })
    }

    /**
     * perform auto sync request to special endpoint returning only entries changed since last auto sync
     */
    function autoSync() {
        if (!currentlyUpdating.value && autoSyncHasFocus.value && !hasFailedItems()) {
            currentlyUpdating.value = true

            const api = new ApiApi()
            api.apiShoppingListEntryList({updatedAfter: autoSyncLastTimestamp.value}).then((r) => {
                autoSyncLastTimestamp.value = r.timestamp!
                r.results.forEach((e) => {
                    entries.value.set(e.id!, e)
                })
                currentlyUpdating.value = false
            }).catch((err: any) => {
                currentlyUpdating.value = false
            })
        }
    }

    /**
     * creates new ShoppingListEntry in database and updates it in store
     * @param object entry to create
     * @param undo if the user should be able to undo the change or not
     */
    function createObject(object: ShoppingListEntry, undo: boolean) {
        const api = new ApiApi()
        return api.apiShoppingListEntryCreate({shoppingListEntry: object}).then((r) => {
            entries.value.set(r.id!, r)
            if (undo) {
                registerChange("CREATE", [r])
            }
            return r
        }).catch((err) => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
            return undefined
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
     * @param undo if the user should be able to undo the change or not
     */
    function deleteObject(object: ShoppingListEntry, undo: boolean) {
        const api = new ApiApi()
        return api.apiShoppingListEntryDestroy({id: object.id!}).then((r) => {
            entries.value.delete(object.id!)
            if (undo) {
                registerChange("DESTROY", [object])
            }
        }).catch((err) => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        })
    }

    /**
     * returns a distinct list of recipes associated with unchecked shopping list entries
     */
    function getAssociatedRecipes(): ShoppingListRecipe[] {
        let recipes = [] as ShoppingListRecipe[]

        entries.value.forEach(e => {
            if (e.listRecipe != null && recipes.findIndex(x => x.id == e.listRecipe) == -1 && isEntryVisible(e, useUserPreferenceStore().deviceSettings)) {
                recipes.push(e.listRecipeData)
            }
        })

        return recipes
    }

    // convenience methods
    /**
     * puts an entry into the appropriate group of the IShoppingList datastructure
     * if a group does not yet exist and the sorting is not set to category with selected supermarket only, it will be created
     * @param structure
     * @param entry
     */
    function updateEntryInStructure(structure: IShoppingList, entry: ShoppingListEntry) {
        let groupingKey = UNDEFINED_CATEGORY

        let group = useUserPreferenceStore().deviceSettings.shopping_selected_grouping

        if (group == ShoppingGroupingOptions.CATEGORY && entry.food != null && entry.food.supermarketCategory != null) {
            groupingKey = entry.food?.supermarketCategory?.name
        } else if (group == ShoppingGroupingOptions.CREATED_BY) {
            groupingKey = entry.createdBy.displayName
        } else if (group == ShoppingGroupingOptions.RECIPE && entry.listRecipeData != null) {
            if (entry.listRecipeData.recipeData != null) {
                groupingKey = entry.listRecipeData.recipeData.name
                if (entry.listRecipeData.mealPlanData != null) {
                    groupingKey += ' - ' + entry.listRecipeData.mealPlanData.mealType.name + ' - ' + DateTime.fromJSDate(entry.listRecipeData.mealPlanData.fromDate).toLocaleString(DateTime.DATE_SHORT)
                }
            }

        }

        if (!structure.categories.has(groupingKey) && !(group == ShoppingGroupingOptions.CATEGORY && useUserPreferenceStore().deviceSettings.shopping_show_selected_supermarket_only)) {
            structure.categories.set(groupingKey, {'name': groupingKey, 'foods': new Map<number, IShoppingListFood>} as IShoppingListCategory)
        }
        if (structure.categories.has(groupingKey)) {
            if (!structure.categories.get(groupingKey).foods.has(entry.food.id)) {
                structure.categories.get(groupingKey).foods.set(entry.food.id, {
                    food: entry.food,
                    entries: new Map<number, ShoppingListEntry>
                } as IShoppingListFood)
            }
            structure.categories.get(groupingKey).foods.get(entry.food.id).entries.set(entry.id, entry)
        }

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
            let promises: Promise<void>[] = []

            itemCheckSyncQueue.value.forEach((entry, index) => {
                entry['status'] = ((entry['status'] === 'waiting') ? 'syncing' : 'syncing_failed_before')

                let p = api.apiShoppingListEntryBulkCreate({shoppingListEntryBulk: entry}, {}).then((r) => {
                    entry.ids.forEach(id => {
                        let e = entries.value.get(id)
                        e.updatedAt = r.timestamp
                        e.checked = r.checked
                        entries.value.set(id, e)
                    })
                    itemCheckSyncQueue.value.splice(index, 1)
                }).catch((err) => {
                    if (err.name === "FetchError") {
                        entry['status'] = 'waiting_failed_before'
                    } else {
                        itemCheckSyncQueue.value.splice(index, 1)
                        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
                    }
                })
                promises.push(p)
            })

            Promise.allSettled(promises).finally(() => {
                if (itemCheckSyncQueue.value.length > 0) {
                    runSyncQueue(500)
                }
            })
        } else {
            // try again if internet after a few seconds
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
    function setEntriesDelayedState(entries: ShoppingListEntry[], delay: boolean, undo: boolean) {
        let delay_hours = useUserPreferenceStore().userSettings.defaultDelay!
        let delayDate = new Date(Date.now() + delay_hours * (60 * 60 * 1000))

        if (undo) {
            registerChange((delay ? 'DELAY' : 'UNDELAY'), entries)
        }
        entries.forEach(entry => {
            entry.delayUntil = (delay ? delayDate : new Date('1970-01-01'))
            updateObject(entry)
        })
    }

    /**
     * ignore all foods of the given entries for shopping in the future and check associated entries from the list
     * @param ignored if the food should be ignored or not ignored (for undo)
     * @param {{}} entries set of entries associated with food to set checked
     * @param undo if the user should be able to undo the change or not
     */
    function setFoodIgnoredState(entries: ShoppingListEntry[], ignored: boolean, undo: boolean) {
        const api = new ApiApi()
        if (undo) {
            registerChange((ignored ? 'IGNORE' : 'UNIGNORE'), entries)
        }

        let foods = [] as Food[]

        entries.forEach(e => {
            if (!foods.includes(e.food!)) {
                foods.push(e.food!)
            }
        })

        setEntriesCheckedState(entries, ignored, false)

        foods.forEach(food => {
            food.ignoreShopping = ignored
            api.apiFoodUpdate({food: food, id: food.id!}).catch(err => {
                useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
            })
        })
    }

    /**
     * delete list of entries
     * @param {{}} entries set of entries
     */
    function deleteEntries(entries: ShoppingListEntry[]) {
        entries.forEach((entry) => {
            deleteObject(entry, false)
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
                setEntriesDelayedState(entries, (type === 'UNDELAY'), false)
            } else if (type === 'CREATE') {
                for (let i in entries) {
                    let e = entries[i]
                    deleteObject(e, false)
                }
            } else if (type === 'DESTROY') {
                for (let i in entries) {
                    let e = entries[i]
                    createObject(e, false)
                }
            } else if (type === 'IGNORE' || type === 'UNIGNORE') {
                setFoodIgnoredState(entries, (type === 'UNIGNORE'), false)
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
        autoSyncTimeoutId,
        autoSyncHasFocus,
        autoSyncLastTimestamp,
        currentlyUpdating,
        initialized,
        getFlatEntries,
        hasFailedItems,
        itemCheckSyncQueue,
        undoStack,
        stats,
        refreshFromAPI,
        autoSync,
        createObject,
        deleteObject,
        updateObject,
        undoChange,
        setEntriesCheckedState,
        setFoodIgnoredState,
        delayEntries: setEntriesDelayedState,
        getAssociatedRecipes,
        getMealPlanEntries,
    }
})

// enable hot reload for store
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useShoppingStore, import.meta.hot))
}