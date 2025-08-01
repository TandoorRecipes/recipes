

export type Integration = {
    id: string,
    name: string,
    import: boolean,
    export: boolean,
    helpUrl: string,
    imgSrc?: string,
}

export const INTEGRATIONS: Array<Integration> = [
    {id: 'DEFAULT', name: "Tandoor", import: true, export: true, helpUrl: 'https://docs.tandoor.dev/features/import_export/#default', imgSrc: 'https://raw.githubusercontent.com/TandoorRecipes/recipes/develop/docs/logo_color.svg'},
    {id: 'CHEFTAP', name: "Cheftap", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#cheftap'},
    {id: 'CHOWDOWN', name: "Chowdown", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#chowdown'},
    {id: 'COOKBOOKAPP', name: "CookBookApp", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#cookbookapp'},
    {id: 'COOKMATE', name: "Cookmate", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#cookmate'},
    {id: 'COPYMETHAT', name: "CopyMeThat", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#copymethat'},
    {id: 'DOMESTICA', name: "Domestica", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#domestica'},
    {id: 'MEALIE', name: "Mealie", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#mealie'},
    {id: 'MEALMASTER', name: "Mealmaster", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#mealmaster'},
    {id: 'MELARECIPES', name: "Melarecipes", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#melarecipes'},
    {id: 'NEXTCLOUD', name: "Nextcloud Cookbook", import: true, export: true, helpUrl: 'https://docs.tandoor.dev/features/import_export/#nextcloud'},
    {id: 'OPENEATS', name: "Openeats", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#openeats'},
    {id: 'PAPRIKA', name: "Paprika", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#paprika'},
    {id: 'PEPPERPLATE', name: "Pepperplate", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#pepperplate'},
    {id: 'PLANTOEAT', name: "Plantoeat", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#plantoeat'},
    {id: 'RECETTETEK', name: "RecetteTek", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#recettetek'},
    {id: 'RECIPEKEEPER', name: "Recipekeeper", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#recipekeeper'},
    {id: 'RECIPESAGE', name: "Recipesage", import: true, export: true, helpUrl: 'https://docs.tandoor.dev/features/import_export/#recipesage'},
    {id: 'REZKONV', name: "Rezkonv", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#rezkonv'},
    {id: 'SAFRON', name: "Safron", import: true, export: true, helpUrl: 'https://docs.tandoor.dev/features/import_export/#safron'},
    {id: 'REZEPTSUITEDE', name: "Rezeptsuite.de", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#rezeptsuitede'},
    {id: 'GOURMET', name: "Gourmet", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#gourmet'},
]
