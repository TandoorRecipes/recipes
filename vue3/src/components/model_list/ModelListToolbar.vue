<template>
    <div v-if="!mobile" class="d-flex align-center ga-2">
        <v-btn
            v-if="hasFilters"
            icon
            variant="text"
            size="small"
            :aria-label="$t('Filters')"
            @click="emit('open-filters')"
        >
            <v-badge
                :model-value="activeFilterCount > 0"
                :content="activeFilterCount"
                color="primary"
            >
                <v-icon>fa-solid fa-filter</v-icon>
            </v-badge>
        </v-btn>

        <v-btn
            v-if="hasMultiSelect"
            icon
            variant="text"
            size="small"
            :color="selectMode ? 'primary' : undefined"
            :aria-label="$t('Select')"
            @click="emit('toggle-select')"
        >
            <v-icon>{{ selectMode ? 'fa-solid fa-square-check' : 'fa-regular fa-square-check' }}</v-icon>
        </v-btn>

        <v-text-field
            prepend-inner-icon="$search"
            :label="$t('Search')"
            :model-value="query"
            @update:model-value="onSearchInput"
            clearable
            hide-details
            density="compact"
            class="flex-grow-1"
        />

        <v-btn
            v-if="showReset"
            icon
            variant="text"
            size="small"
            :aria-label="$t('Reset')"
            @click="emit('reset')"
        >
            <v-icon>fa-solid fa-arrow-rotate-left</v-icon>
            <v-tooltip activator="parent" :text="$t('Reset')" location="top" :open-delay="400" />
        </v-btn>

        <v-btn
            v-if="sortOptions.length > 0"
            variant="text"
            class="text-none flex-shrink-0"
            :append-icon="isDescending ? 'fa-solid fa-arrow-down-short-wide' : 'fa-solid fa-arrow-up-short-wide'"
        >
            {{ $t('sort_by') }} {{ currentLabel }}
            <v-menu activator="parent" close-on-content-click>
                <v-list density="compact">
                    <v-list-item
                        v-for="opt in sortOptions"
                        :key="opt.key"
                        :active="currentField === opt.key"
                        @click="onSortSelect(opt.key)"
                    >
                        {{ $t(opt.labelKey) }}
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-btn>

        <v-btn
            v-if="hasFilters"
            icon
            variant="text"
            size="small"
            :aria-label="$t('Settings')"
            @click="emit('open-settings')"
        >
            <v-icon>fa-solid fa-sliders</v-icon>
        </v-btn>
    </div>

    <div v-else>
        <v-text-field
            prepend-inner-icon="$search"
            :label="$t('Search')"
            :model-value="query"
            @update:model-value="onSearchInput"
            clearable
            hide-details
            density="compact"
        />

        <div class="model-list-toolbar-carousel-wrapper mt-2">
        <div ref="carouselRef" class="model-list-toolbar-carousel" role="toolbar" :aria-label="$t('Actions')" @scroll.passive="onCarouselScroll">
            <v-btn
                v-if="showReset"
                variant="text"
                density="compact"
                prepend-icon="fa-solid fa-arrow-rotate-left"
                class="text-none flex-shrink-0"
                @click="emit('reset')"
            >
                {{ $t('Reset') }}
            </v-btn>

            <v-btn
                v-if="hasFilters"
                variant="text"
                density="compact"
                prepend-icon="fa-solid fa-filter"
                class="text-none flex-shrink-0"
                @click="emit('open-filters')"
            >
                <v-badge
                    :model-value="activeFilterCount > 0"
                    :content="activeFilterCount"
                    color="primary"
                    inline
                >
                    {{ $t('Filters') }}
                </v-badge>
            </v-btn>

            <v-btn
                v-if="hasMultiSelect"
                variant="text"
                density="compact"
                class="text-none flex-shrink-0"
                :color="selectMode ? 'primary' : undefined"
                :prepend-icon="selectMode ? 'fa-solid fa-square-check' : 'fa-regular fa-square-check'"
                @click="emit('toggle-select')"
            >
                {{ $t('Select') }}
            </v-btn>

            <v-btn
                v-if="sortOptions.length > 0"
                variant="text"
                density="compact"
                class="text-none flex-shrink-0"
                :append-icon="isDescending ? 'fa-solid fa-arrow-down-short-wide' : 'fa-solid fa-arrow-up-short-wide'"
            >
                {{ $t('sort_by') }} {{ currentLabel }}
                <v-menu activator="parent" close-on-content-click>
                    <v-list density="compact">
                        <v-list-item
                            v-for="opt in sortOptions"
                            :key="opt.key"
                            :active="currentField === opt.key"
                            @click="onSortSelect(opt.key)"
                        >
                            {{ $t(opt.labelKey) }}
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-btn>

            <v-btn
                v-if="hasFilters"
                variant="text"
                density="compact"
                prepend-icon="fa-solid fa-sliders"
                class="text-none flex-shrink-0"
                @click="emit('open-settings')"
            >
                {{ $t('Settings') }}
            </v-btn>
        </div>
        <v-icon
            v-if="canScrollRight"
            icon="fa-solid fa-chevron-right"
            size="x-small"
            class="carousel-scroll-hint"
        />
        </div>
    </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useDisplay} from 'vuetify'
import {useI18n} from 'vue-i18n'
import type {SortDef} from '@/composables/modellist/types'
import {useDebounceFn, useResizeObserver} from '@vueuse/core'

const {t} = useI18n()
const {mobile} = useDisplay()

const carouselRef = ref<HTMLElement | null>(null)
const canScrollRight = ref(false)

function checkCarouselOverflow() {
    const el = carouselRef.value
    if (!el) { canScrollRight.value = false; return }
    canScrollRight.value = el.scrollWidth > el.clientWidth + el.scrollLeft + 4
}

function onCarouselScroll() { checkCarouselOverflow() }

onMounted(() => checkCarouselOverflow())
useResizeObserver(carouselRef, () => checkCarouselOverflow())

const props = withDefaults(defineProps<{
    query?: string
    ordering?: string
    sortOptions?: SortDef[]
    hasFilters?: boolean
    activeFilterCount?: number
    hasMultiSelect?: boolean
    selectMode?: boolean
    showReset?: boolean
}>(), {
    query: '',
    ordering: '',
    sortOptions: () => [],
    hasFilters: false,
    activeFilterCount: 0,
    hasMultiSelect: false,
    selectMode: false,
    showReset: false,
})

const emit = defineEmits<{
    'update:query': [val: string]
    'update:ordering': [val: string]
    'open-filters': []
    'open-settings': []
    'toggle-select': []
    'reset': []
}>()

const debouncedEmitQuery = useDebounceFn((val: string) => {
    emit('update:query', val)
}, 300)

function onSearchInput(val: string | null) {
    debouncedEmitQuery(val ?? '')
}

const effectiveOrdering = computed(() =>
    props.ordering || (props.sortOptions.length > 0 ? props.sortOptions[0]!.key : '')
)

const currentField = computed(() => {
    const ord = effectiveOrdering.value
    return ord.startsWith('-') ? ord.slice(1) : ord
})

const isDescending = computed(() => effectiveOrdering.value.startsWith('-'))

const currentLabel = computed(() => {
    const opt = props.sortOptions.find(o => o.key === currentField.value)
    return opt ? t(opt.labelKey) : ''
})

function onSortSelect(key: string) {
    if (key === currentField.value) {
        // Same field: toggle direction
        emit('update:ordering', isDescending.value ? key : `-${key}`)
    } else {
        // New field: use defaultDescending if set, otherwise ascending
        const opt = props.sortOptions.find(o => o.key === key)
        emit('update:ordering', opt?.defaultDescending ? `-${key}` : key)
    }
}
</script>

<style scoped>
.model-list-toolbar-carousel-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.model-list-toolbar-carousel {
    display: flex;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 4px;
    align-items: center;
    flex: 1;
    min-width: 0;
}

.model-list-toolbar-carousel::-webkit-scrollbar {
    display: none;
}

.carousel-scroll-hint {
    flex-shrink: 0;
    opacity: 0.4;
    margin-left: 2px;
}
</style>
