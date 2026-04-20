<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card prepend-icon="fa-solid fa-chart-simple" :title="$t('Stats')">
                    <template #subtitle>
                        <div class="text-wrap">
                            {{ $t('View your cooking history with recipe properties') }}
                        </div>
                    </template>
                    <template #append>
                        <v-select
                            v-model="groupBy"
                            :items="groupOptions"
                            label="Group by"
                            hide-details
                            density="compact"
                            style="max-width: 200px;"
                        ></v-select>
                    </template>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <v-card>
                    <v-card-text>
                        <v-data-table
                            :headers="headers"
                            :items="displayItems"
                            :loading="loading"
                            :item-key="groupBy.value !== 'none' ? 'title' : 'id'"
                            :sort-by="[{ key: 'createdAt', order: 'desc' }]"
                        >
                            <!-- Date column -->
                            <template #item.createdAt="{ item }">
                                <template v-if="groupBy.value !== 'none' && item.title">
                                    <div>
                                        <strong>{{ item.title }}</strong>
                                    </div>
                                    <div class="text-caption text-disabled">
                                        {{ DateTime.fromJSDate(item.startDate).toLocaleString(DateTime.DATE_MED) }}
                                        -
                                        {{ DateTime.fromJSDate(item.endDate).toLocaleString(DateTime.DATE_MED) }}
                                        <br>
                                        ({{ item.daysInPeriod }} day(s))
                                    </div>
                                </template>
                                <template v-else>
                                    {{ DateTime.fromJSDate(item.createdAt).toLocaleString(DateTime.DATE_MED) }}
                                </template>
                            </template>

                            <!-- Recipe column -->
                            <template #item.recipe="{ item }">
                                <template v-if="groupBy.value !== 'none' && item.entries">
                                    <div class="text-body-2">
                                        <strong>{{ item.entries.length }} recipe(s)</strong>
                                    </div>
                                    <div v-for="entry in item.entries" :key="entry.id" class="text-caption">
                                        <router-link :to="{ name: 'RecipeViewPage', params: { id: entry.recipe } }">
                                            {{ getRecipeName(entry.recipe) }}
                                        </router-link>
                                        <span v-if="entry.rating" class="ml-2">
                                            <v-rating v-model="entry.rating" density="compact" readonly inline length="5"></v-rating>
                                        </span>
                                    </div>
                                </template>
                                <template v-else>
                                    <router-link :to="{ name: 'RecipeViewPage', params: { id: item.recipe } }">
                                        {{ getRecipeName(item.recipe) }}
                                    </router-link>
                                </template>
                            </template>

                            <!-- Rating column -->
                            <template #item.rating="{ item }">
                                <template v-if="groupBy.value !== 'none' && item.averageRating !== undefined">
                                    <div>
                                        <v-rating
                                            v-model="item.averageRating"
                                            density="compact"
                                            readonly
                                            length="5"
                                        ></v-rating>
                                    </div>
                                    <div class="text-caption text-disabled">
                                        {{ item.averageRating.toFixed(1) }} avg
                                    </div>
                                </template>
                                <template v-else>
                                    <v-rating
                                        v-model="item.rating"
                                        density="compact"
                                        readonly
                                        v-if="item.rating"
                                    ></v-rating>
                                </template>
                            </template>

                            <!-- Servings column -->
                            <template #item.servings="{ item }">
                                <template v-if="groupBy.value !== 'none' && item.totalServings !== undefined">
                                    <div>
                                        <strong>{{ item.totalServings }}</strong>
                                    </div>
                                    <div class="text-caption text-disabled">
                                        {{ (item.totalServings / item.daysInPeriod).toFixed(1) }} / day
                                    </div>
                                </template>
                                <template v-else>
                                    {{ item.servings }}
                                </template>
                            </template>

                            <!-- Comment column -->
                            <template #item.comment="{ item }">
                                <template v-if="groupBy.value !== 'none' && item.entries">
                                    <span class="text-caption">{{ item.entries.filter(e => e.comment).length }} with comment(s)</span>
                                </template>
                                <template v-else>
                                    {{ item.comment || '-' }}
                                </template>
                            </template>

                            <!-- Dynamic property columns -->
                            <template v-for="prop in Array.from(discoveredProperties.values())" :key="`property_${prop.id}`" #[`item.property_${prop.id}`]="{ item }">
                                <template v-if="groupBy.value !== 'none' && item.propertyAveragesPerDay">
                                    <div>
                                        <span v-if="item.propertyAveragesPerDay.get(prop.id) !== undefined">
                                            {{ item.propertyAveragesPerDay.get(prop.id) }}<span v-if="prop.unit">{{ prop.unit }}</span>
                                        </span>
                                        <span v-else class="text-disabled">-</span>
                                    </div>
                                    <div class="text-caption text-disabled">
                                        {{ Math.round(item.propertyTotals.get(prop.id) * 100) / 100 }}<span v-if="prop.unit">{{ prop.unit }}</span> total
                                    </div>
                                </template>
                                <template v-else>
                                    <span v-if="getPropertyValue(item.recipe, prop.id) !== null">
                                        {{ getPropertyValue(item.recipe, prop.id) }}<span v-if="prop.unit">{{ prop.unit }}</span>
                                    </span>
                                    <span v-else class="text-disabled">-</span>
                                </template>
                            </template>

                            <!-- Action column -->
                            <template #item.action="{ item }">
                                <template v-if="groupBy.value !== 'none' && item.entries">
                                    <v-btn
                                        icon="$menu"
                                        variant="plain"
                                        size="small"
                                    >
                                        <v-icon icon="$menu"></v-icon>
                                        <v-menu activator="parent" close-on-content-click>
                                            <v-list density="compact">
                                                <v-list-item
                                                    prepend-icon="fa-solid fa-list"
                                                    @click="expandGroup()"
                                                >
                                                    {{ $t('View Entries') }}
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </v-btn>
                                </template>
                                <template v-else>
                                    <v-btn
                                        icon="$menu"
                                        variant="plain"
                                        size="small"
                                    >
                                        <v-icon icon="$menu"></v-icon>
                                        <v-menu activator="parent" close-on-content-click>
                                            <v-list density="compact">
                                                <v-list-item
                                                    prepend-icon="$edit"
                                                    @click="editCookLog(item)"
                                                >
                                                    {{ $t('Edit') }}
                                                </v-list-item>
                                                <v-list-item
                                                    prepend-icon="$delete"
                                                    @click="deleteCookLog(item)"
                                                >
                                                    {{ $t('Delete') }}
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </v-btn>
                                </template>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Edit Dialog -->
        <model-edit-dialog
            model="CookLog"
            :item="editingItem"
            v-model="editDialog"
            @save="onCookLogSaved"
            @delete="onCookLogDeleted"
        ></model-edit-dialog>
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue"
import { ApiApi, CookLog } from "@/openapi"
import { DateTime } from "luxon"
import { useMessageStore, ErrorMessageType } from "@/stores/MessageStore"
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue"

const loading = ref(false)
const cookLogs = ref<CookLog[]>([])
const editDialog = ref(false)
const editingItem = ref<CookLog | null>(null)
const groupBy = ref<'none' | 'day' | 'week' | 'month' | 'year'>('none')

const groupOptions = [
    { title: 'Individual', value: 'none' },
    { title: 'Day', value: 'day' },
    { title: 'Week', value: 'week' },
    { title: 'Month', value: 'month' },
    { title: 'Year', value: 'year' },
]

// Cache for recipe data
interface RecipeData {
    recipe: any // Use any to access food_properties which isn't in TypeScript type
}
const recipeCache = ref<Map<number, RecipeData>>(new Map())

// Discovered property types from all recipes
interface PropertyType {
    id: number
    name: string
    unit?: string | null
    category?: string | null
}
const discoveredProperties = ref<Map<number, PropertyType>>(new Map())

// Fixed columns
const fixedHeaders = [
    { title: 'Date', key: 'createdAt', sortable: true },
    { title: 'Recipe', key: 'recipe', sortable: false },
    { title: 'Rating', key: 'rating', sortable: true },
    { title: 'Servings', key: 'servings', sortable: true },
    { title: 'Comment', key: 'comment', sortable: false },
    { title: '', key: 'action', sortable: false, align: 'end' },
]

// Dynamic headers based on discovered properties
const headers = computed(() => {
    const dynamicHeaders = Array.from(discoveredProperties.value.values())
        .map(prop => ({
            title: prop.name,
            key: `property_${prop.id}`,
            sortable: false,
        }))

    return [...fixedHeaders, ...dynamicHeaders]
})

// Grouped data by date
interface GroupedCookLog {
    title: string
    startDate: Date
    endDate: Date
    entries: CookLog[]
    totalServings: number
    propertyTotals: Map<number, number>
    propertyAveragesPerDay: Map<number, number>
    daysInPeriod: number
    averageRating: number
}

function getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is sunday
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
}

function getMonthYear(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getWeekKey(date: Date): string {
    const weekStart = getWeekStart(date)
    return weekStart.toISOString().split('T')[0]
}

const groupedCookLogs = computed<GroupedCookLog[]>(() => {
    if (groupBy.value === 'none') {
        return []
    }

    const groups = new Map<string, GroupedCookLog>()

    for (const log of cookLogs.value) {
        const date = new Date(log.createdAt)
        let periodKey: string
        let title: string
        let startDate: Date
        let endDate: Date

        if (groupBy.value === 'day') {
            periodKey = date.toISOString().split('T')[0]
            title = DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_FULL)
            startDate = new Date(date)
            startDate.setHours(0, 0, 0, 0)
            endDate = new Date(date)
            endDate.setHours(23, 59, 59, 999)
        } else if (groupBy.value === 'week') {
            const weekStart = getWeekStart(date)
            periodKey = getWeekKey(date)
            title = `Week of ${DateTime.fromJSDate(weekStart).toLocaleString(DateTime.DATE_MED)}`
            startDate = weekStart
            endDate = new Date(weekStart)
            endDate.setDate(endDate.getDate() + 6)
            endDate.setHours(23, 59, 59, 999)
        } else if (groupBy.value === 'month') {
            periodKey = getMonthYear(date)
            title = DateTime.fromJSDate(date).toLocaleString({ month: 'long', year: 'numeric' })
            startDate = new Date(date.getFullYear(), date.getMonth(), 1)
            endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
        } else if (groupBy.value === 'year') {
            periodKey = String(date.getFullYear())
            title = String(date.getFullYear())
            startDate = new Date(date.getFullYear(), 0, 1)
            endDate = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999)
        } else {
            continue
        }

        if (!groups.has(periodKey)) {
            groups.set(periodKey, {
                title,
                startDate,
                endDate,
                entries: [],
                totalServings: 0,
                propertyTotals: new Map(),
                propertyAveragesPerDay: new Map(),
                daysInPeriod: 1,
                averageRating: 0,
            })
        }

        const group = groups.get(periodKey)!
        group.entries.push(log)
        group.totalServings += log.servings || 0

        // Sum property values for each property type
        for (const prop of Array.from(discoveredProperties.value.values())) {
            const value = getPropertyValue(log.recipe, prop.id)
            if (value !== null) {
                const current = group.propertyTotals.get(prop.id) || 0
                group.propertyTotals.set(prop.id, current + value)
            }
        }
    }

    // Calculate days in period and averages
    for (const group of groups.values()) {
        const msInDay = 24 * 60 * 60 * 1000
        // Calculate days: for day/week/month/year, endDate is set to end of last day
        // so we round the difference to get whole days
        group.daysInPeriod = Math.round((group.endDate.getTime() - group.startDate.getTime()) / msInDay)

        // Calculate averages per day
        for (const [propId, total] of group.propertyTotals) {
            group.propertyAveragesPerDay.set(propId, Math.round((total / group.daysInPeriod) * 100) / 100)
        }

        // Calculate average rating
        const ratings = group.entries.filter(e => e.rating).map(e => e.rating!)
        group.averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    }

    // Sort by start date descending
    return Array.from(groups.values()).sort((a, b) =>
        b.startDate.getTime() - a.startDate.getTime()
    )
})

const displayItems = computed(() => {
    return groupBy.value !== 'none' ? groupedCookLogs.value : cookLogs.value
})

onMounted(() => {
    loadCookLogs()
})

function loadCookLogs() {
    const api = new ApiApi()
    loading.value = true

    api.apiCookLogList({ pageSize: 100 }).then(r => {
        cookLogs.value = r.results || []
        // Fetch recipes for nutrition data
        fetchRecipesForLogs(cookLogs.value)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

function fetchRecipesForLogs(logs: CookLog[]) {
    const recipeIds = [...new Set(logs.map(l => l.recipe))]

    Promise.all(
        recipeIds.map(id =>
            // Use raw fetch to get full response including food_properties
            fetch(`/api/recipe/${id}/`, {
                headers: {
                    'Authorization': 'Bearer ' + (localStorage.getItem('access_token') || '')
                }
            })
                .then(r => r.json())
                .then(recipe => {
                    recipeCache.value.set(id, { recipe })
                    discoverPropertiesFromRecipe(recipe)
                })
                .catch(err => {
                    console.error(`Failed to load recipe ${id}:`, err)
                })
        )
    ).finally(() => {
        cookLogs.value = [...cookLogs.value]
    })
}

function discoverPropertiesFromRecipe(recipe: any) {
    // Collect from properties array (manual recipe properties)
    if (recipe.properties && Array.isArray(recipe.properties)) {
        for (const prop of recipe.properties) {
            const propertyType = prop.propertyType || prop.property_type
            if (propertyType && !discoveredProperties.value.has(propertyType.id)) {
                discoveredProperties.value.set(propertyType.id, {
                    id: propertyType.id,
                    name: propertyType.name,
                    unit: propertyType.unit,
                    category: propertyType.category,
                })
            }
        }
    }

    // Collect from food_properties (calculated from ingredients)
    const foodProperties = recipe.food_properties
    if (foodProperties) {
        for (const propId in foodProperties) {
            const prop = foodProperties[propId]
            if (!discoveredProperties.value.has(prop.id)) {
                discoveredProperties.value.set(prop.id, {
                    id: prop.id,
                    name: prop.name,
                    unit: prop.unit,
                    category: prop.category,
                })
            }
        }
    }
}

function getRecipeName(recipeId: number): string {
    const cached = recipeCache.value.get(recipeId)
    return cached?.recipe.name || `Recipe #${recipeId}`
}

/**
 * Get property value by property type ID, preferring manual properties, falling back to calculated food properties
 */
function getPropertyValue(recipeId: number, propertyTypeId: number): number | null {
    const cached = recipeCache.value.get(recipeId)
    if (!cached) {
        return null
    }

    const recipe = cached.recipe

    // 1. First try manual properties array
    if (recipe.properties && Array.isArray(recipe.properties)) {
        const prop = recipe.properties.find((p: any) =>
            (p.propertyType || p.property_type)?.id === propertyTypeId
        )
        const amount = prop?.propertyAmount || prop?.property_amount
        if (amount > 0) {
            return amount
        }
    }

    // 2. Fall back to calculated food properties
    const foodProperties = recipe.food_properties
    if (foodProperties) {
        for (const propId in foodProperties) {
            const prop = foodProperties[propId]
            if (prop.id === propertyTypeId && prop.total_value) {
                return Math.round(prop.total_value * 100) / 100
            }
        }
    }

    return null
}

function editCookLog(item: CookLog) {
    editingItem.value = { ...item }
    editDialog.value = true
}

function onCookLogSaved() {
    editDialog.value = false
    loadCookLogs()
    useMessageStore().addPreparedMessage({ key: 'UPDATE_SUCCESS' })
}

function onCookLogDeleted() {
    editDialog.value = false
    loadCookLogs()
    useMessageStore().addPreparedMessage({ key: 'DELETE_SUCCESS' })
}

function expandGroup() {
    // Disable grouping to show individual entries
    groupBy.value = 'none'
    // Scroll to top to see the entries
    window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
</style>
