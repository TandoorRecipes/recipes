import {defineStore} from 'pinia'
import {ApiApiFactory} from "@/utils/openapi/api";

const _STORE_ID = 'meal_plan_store'
import Vue from "vue"
import {StandardToasts} from "@/utils/utils";
/*
* test store to play around with pinia and see if it can work for my usecases
* dont trust that all mealplans are in store as there is no cache validation logic, its just a shared data holder
* */
export const useMealPlanStore = defineStore(_STORE_ID, {
    state: () => ({
        plans: {},
        currently_updating: null,
    }),
    getters: {
        plan_list: function () {
            let plan_list = []
            for (let key in this.plans) {
                plan_list.push(this.plans[key]);
            }
            return plan_list
        },
        empty_meal_plan: function () {
            return {
                date: null,
                id: -1,
                meal_type: null,
                note: "",
                note_markdown: "",
                recipe: null,
                servings: 1,
                shared: [],
                title: "",
                title_placeholder: 'Title', // meal plan edit modal should be improved to not need this
            }
        }
    },
    actions: {
        refreshFromAPI(from_date, to_date) {
            if (this.currently_updating !== [from_date, to_date]) {
                this.currently_updating = [from_date, to_date] // certainly no perfect check but better than nothing

                let options = {
                    query: {
                        from_date: from_date,
                        to_date: to_date,
                    },
                }

                let apiClient = new ApiApiFactory()
                apiClient.listMealPlans(options).then(r => {
                    r.data.forEach((p) => {
                        Vue.set(this.plans, p.id, p)
                    })
                    this.currently_updating = null
                })
            }
        },
        createObject(object) {
            let apiClient = new ApiApiFactory()
            return apiClient.createMealPlan(object).then(r => {
                //StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
                Vue.set(this.plans, r.data.id, r.data)
                return r
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE, err)
            })
        },
        updateObject(object) {
            let apiClient = new ApiApiFactory()
            return apiClient.updateMealPlan(object.id, object).then(r => {
                //StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                Vue.set(this.plans, object.id, object)
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        deleteObject(object) {
            let apiClient = new ApiApiFactory()
            return apiClient.destroyMealPlan(object.id).then(r => {
                //StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_DELETE)
                Vue.delete(this.plans, object.id)
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
            })
        }
    },
})