import {useI18n} from 'vue-i18n'
import {formatDuration} from '@/utils/duration_utils'

export type DurationDisplay = (minutes: number | null | undefined) => string

/**
 * binds the shared duration formatter to the active locale, for use at the read only duration
 * displays (recipe times, step times, step timer button)
 *
 * @returns a function rendering a duration given in minutes for display
 */
export function useDurationDisplay(): DurationDisplay {
    const {t} = useI18n()

    return (minutes: number | null | undefined) => formatDuration(minutes, {hour: t('h'), minute: t('min')})
}
