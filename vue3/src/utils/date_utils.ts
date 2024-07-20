import {DateTime} from "luxon";

/**
 * shifts a range of dates/any array of dates by the number of days given in the day modifier (can be positive or negative)
 * @param dateRange array of dates
 * @param dayModifier number of days to modify array of dates with
 * @return dateRange array of dates modified
 */
export function shiftDateRange(dateRange: Date[], dayModifier: number) {
    let newDateRange: Date[] = []
    dateRange.forEach(date => {
        newDateRange.push(DateTime.fromJSDate(date).plus({'days': dayModifier}).toJSDate())
    })
    return newDateRange
}

/**
 * adjust the length of a date range by either adding or removing the given number of days
 * when adding days to an empty date Range it starts with the current date
 * @param dateRange array of dates
 * @param dayModifier number of days to modify array of dates with
 * @return dateRange sorted array of dates modified
 */
export function adjustDateRangeLength(dateRange: Date[], dayModifier: number) {
    dateRange = dateRange.sort((a: Date, b: Date) => a.getTime() - b.getTime());
    if (dayModifier < 0) {
        dateRange.splice(dateRange.length - Math.abs(dayModifier), Math.abs(dayModifier))
    } else {
        if (dateRange.length == 0) {
            dateRange.push(new Date())
        } else {
            let lastDate = DateTime.fromJSDate(dateRange[dateRange.length - 1])
            for (let i = 0; i < dayModifier; i++) {
                dateRange.push(lastDate.plus({'days': (i + 1)}).toJSDate())
            }
        }
    }
    return dateRange
}