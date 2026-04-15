<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card prepend-icon="fa-solid fa-clock-rotate-left" :title="$t('Cook Log')">
                    <template #subtitle>
                        <div class="text-wrap">
                            {{ $t('View your cooking history with recipe properties') }}
                        </div>
                    </template>
                    <template #append>
                        <v-switch
                            v-model="groupByDay"
                            label="Group by Day"
                            hide-details
                            density="compact"
                            style="max-width: 200px;"
                        ></v-switch>
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
                            :item-key="groupByDay ? 'dateString' : 'id'"
                        >
                            <!-- Date column -->
                            <template #item.date="{ item }">
                                <template v-if="groupByDay">
                                    <strong>{{ DateTime.fromISO(item.dateString).toLocaleString(DateTime.DATE_MED) }}</strong>
                                </template>
                                <template v-else>
                                    {{ DateTime.fromJSDate(item.createdAt).toLocaleString(DateTime.DATE_MED) }}
                                </template>
                            </template>

                            <!-- Recipe column -->
                            <template #item.recipe="{ item }">
                                <template v-if="groupByDay">
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
                                <template v-if="groupByDay">
                                    <span class="text-caption">Avg: {{ averageRating(item.entries).toFixed(1) }}</span>
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
                                <template v-if="groupByDay">
                                    <strong>{{ item.totalServings }}</strong>
                                </template>
                                <template v-else>
                                    {{ item.servings }}
                                </template>
                            </template>

                            <!-- Comment column -->
                            <template #item.comment="{ item }">
                                <template v-if="groupByDay">
                                    <span class="text-caption">{{ item.entries.filter(e => e.comment).length }} with comment(s)</span>
                                </template>
                                <template v-else>
                                    {{ item.comment || '-' }}
                                </template>
                            </template>

                            <!-- Dynamic property columns -->
                            <template v-for="prop in Array.from(discoveredProperties.values())" :key="`property_${prop.id}`" #[`item.property_${prop.id}`]="{ item }">
                                <template v-if="groupByDay">
                                    <strong v-if="item.propertyTotals.get(prop.id) !== undefined">
                                        {{ item.propertyTotals.get(prop.id) }}<span v-if="prop.unit">{{ prop.unit }}</span>
                                    </strong>
                                    <span v-else class="text-disabled">-</span>
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
                                <template v-if="groupByDay">
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
                                                    @click="expandDay(item)"
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
const groupByDay = ref(false)

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
    { title: 'Date', key: 'date', sortable: true },
    { title: 'Recipe', key: 'recipe', sortable: true },
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
    date: Date
    dateString: string
    entries: CookLog[]
    totalServings: number
    propertyTotals: Map<number, number>
}

const groupedCookLogs = computed<GroupedCookLog[]>(() => {
    if (!groupByDay.value) {
        return []
    }

    const groups = new Map<string, GroupedCookLog>()

    for (const log of cookLogs.value) {
        const date = new Date(log.createdAt)
        const dateStr = date.toISOString().split('T')[0]

        if (!groups.has(dateStr)) {
            groups.set(dateStr, {
                date,
                dateString: dateStr,
                entries: [],
                totalServings: 0,
                propertyTotals: new Map(),
            })
        }

        const group = groups.get(dateStr)!
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

    // Sort by date descending
    return Array.from(groups.values()).sort((a, b) =>
        new Date(b.dateString).getTime() - new Date(a.dateString).getTime()
    )
})

const displayItems = computed(() => {
    return groupByDay.value ? groupedCookLogs.value : cookLogs.value
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

function averageRating(entries: CookLog[]): number {
    const ratings = entries.filter(e => e.rating).map(e => e.rating!)
    if (ratings.length === 0) return 0
    return ratings.reduce((a, b) => a + b, 0) / ratings.length
}

function expandDay(group: GroupedCookLog) {
    // Disable grouping to show individual entries
    groupByDay.value = false
    // Scroll to top to see the entries
    window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
</style>
