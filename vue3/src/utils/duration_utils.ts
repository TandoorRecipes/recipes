/**
 * unit labels used when rendering a duration
 * passed in by the caller so that no unit string is ever inlined in the conversion logic
 */
export interface DurationLabels {
    hour: string
    minute: string
}

/**
 * English fallbacks, used when a caller has no i18n context (tests, plain scripts)
 */
export const DEFAULT_DURATION_LABELS: DurationLabels = {hour: 'h', minute: 'min'}

/**
 * formats a duration given in minutes for display
 *
 * below one hour the duration is rendered as plain minutes, from one hour upwards as hours plus the
 * remaining minutes when there are any (90 -> "1 h 30 min", 120 -> "2 h"). Days are deliberately not
 * used, a 72 hour proof reads as "72 h".
 *
 * @param minutes duration in minutes, as stored on recipes and steps
 * @param labels translated unit labels
 * @returns the formatted duration, empty for a missing value
 */
export function formatDuration(minutes: number | null | undefined, labels: DurationLabels = DEFAULT_DURATION_LABELS): string {
    if (minutes === null || minutes === undefined || Number.isNaN(minutes)) {
        return ''
    }

    const total = Math.round(minutes)
    if (!Number.isFinite(total) || total < 60) {
        return `${minutes} ${labels.minute}`
    }

    const hours = Math.floor(total / 60)
    const remainder = total - hours * 60

    if (remainder === 0) {
        return `${hours} ${labels.hour}`
    }
    return `${hours} ${labels.hour} ${remainder} ${labels.minute}`
}
