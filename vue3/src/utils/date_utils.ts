import {DateTime} from "luxon";

/**
 * shifts a range of dates/any array of dates by the number of days given in the day modifier (can be positive or negative)
 * @param dateRange
 * @param dayModifier
 */
export function shiftDateRange(dateRange: Date[], dayModifier: number){
    let newDateRange: Date[] = []
    dateRange.forEach(date => {
        newDateRange.push(DateTime.fromJSDate(date).plus({'days': dayModifier}).toJSDate())
    })
    return newDateRange
}