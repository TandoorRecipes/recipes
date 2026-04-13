export interface  SearchResult {
    name: string,
    recipeId?: number,
    suffix?: string,
    description?: string,
    icon?: string,
    image?: string|null,
    imageCropData?: Record<string, number>|null,
    type: 'recipe'|'link_advanced_search'
}
