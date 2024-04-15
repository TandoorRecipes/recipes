import {MealPlan} from "@/openapi";
import {ICalendarItem} from "vue-simple-calendar/dist/src/ICalendarItem";

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