import {ApiApi, Keyword as IKeyword, Food as IFood, RecipeOverview as IRecipeOverview, Recipe as IRecipe, Unit as IUnit, MealType as IMealType, User as IUser} from "@/openapi";

export function getModelFromStr(model_name: String) {
    switch (model_name.toLowerCase()) {
        case 'food': {
            return new Food
        }
        case 'unit': {
            return new Unit
        }
        case 'keyword': {
            return new Keyword
        }
        case 'recipe': {
            return new Recipe
        }
        case 'mealtype': {
            return new MealType
        }
        case 'user': {
            return new User
        }
        default: {
            throw Error(`Invalid Model ${model_name}, did you forget to register it in Models.ts?`)
        }
    }
}

export abstract class GenericModel<T> {
    abstract list(query: string): Promise<Array<T>>

    abstract create(name: string): Promise<T>
}

//TODO this can probably be achieved by manipulating the client generation https://openapi-generator.tech/docs/templating/#models
export class Keyword extends GenericModel<IKeyword> {
    create(name: string) {
        const api = new ApiApi()
        return api.apiKeywordCreate({keyword: {name: name} as IKeyword})
    }

    list(query: string) {
        const api = new ApiApi()
        return api.apiKeywordList({query: query}).then(r => {
            if (r.results) {
                return r.results
            } else {
                return []
            }
        })
    }
}

export class Food extends GenericModel<IFood> {
    create(name: string) {
        const api = new ApiApi()
        return api.apiFoodCreate({food: {name: name} as IFood})
    }

    list(query: string) {
        const api = new ApiApi()
        return api.apiFoodList({query: query}).then(r => {
            if (r.results) {
                return r.results
            } else {
                return []
            }
        })
    }
}

export class Unit extends GenericModel<IUnit> {
    create(name: string) {
        const api = new ApiApi()
        return api.apiUnitCreate({unit: {name: name} as IUnit})
    }

    list(query: string) {
        const api = new ApiApi()
        return api.apiUnitList({query: query}).then(r => {
            if (r.results) {
                return r.results
            } else {
                return []
            }
        })
    }
}

export class Recipe extends GenericModel<IRecipeOverview> {
    create(name: string) {
        const api = new ApiApi()
        return api.apiRecipeCreate({recipe: {name: name} as IRecipe}).then(r => {
            return r as unknown as IRecipeOverview
        })
    }

    list(query: string) {
        const api = new ApiApi()
        return api.apiRecipeList({query: query}).then(r => {
            if (r.results) {
                return r.results
            } else {
                return []
            }
        })
    }
}

export class MealType extends GenericModel<IMealType> {
    create(name: string) {
        const api = new ApiApi()
        return api.apiMealTypeCreate({mealType: {name: name} as IMealType}).then(r => {
            return r as unknown as IRecipeOverview
        })
    }

    list(query: string) {
        const api = new ApiApi()
        return api.apiMealTypeList({}).then(r => {
            if (r.results) {
                return r.results
            } else {
                return []
            }
        })
    }
}

export class User extends GenericModel<IUser> {
    create(name: string) {
        return new Promise<undefined>( () => {
            return undefined
        })
     }

    list(query: string) {
        const api = new ApiApi()
        return api.apiUserList({}).then(r => {
            if (r) {
                return r
            } else {
                return []
            }
        })
    }
}