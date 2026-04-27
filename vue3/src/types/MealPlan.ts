import {MealPlan} from "@/openapi";
import type {ICalendarItem} from "vue-simple-calendar/interfaces";

export interface IMealPlanCalendarItem {
	startDate: Date,
	endDate: Date,
	id: number,
	mealPlan: MealPlan
}
export interface IMealPlanNormalizedCalendarItem extends ICalendarItem {
	endDate: Date
	originalItem: IMealPlanCalendarItem
	classes: string[]
	itemRow?: number,
	id: string,
}