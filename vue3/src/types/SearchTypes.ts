export interface  SearchResult {
    name: string,
    recipe_id?: number,
    suffix?: string,
    description?: string,
    icon?: string,
    image?: string,
}

export interface FlatRecipe{
    id: number,
    name: string,
    image:string|null,
}