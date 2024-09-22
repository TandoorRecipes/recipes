import {
    ApiApi,
    Keyword as IKeyword,
    Food as IFood,
    RecipeOverview as IRecipeOverview,
    Recipe as IRecipe,
    Unit as IUnit,
    MealType as IMealType,
    User as IUser,
    FoodInheritField as IFoodInheritField,
    SupermarketCategory as ISupermarketCategory,
    PropertyType as IPropertyType,
} from "@/openapi";

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
        case 'foodinheritfield': {
            return new FoodInheritField
        }
        case 'supermarketcategory': {
            return new SupermarketCategory
        }
        case 'propertytype': {
            return new PropertyType
        }
        default: {
            throw Error(`Invalid Model ${model_name}, did you forget to register it in Models.ts?`)
        }
    }
}

/**
 * Generic model used for generic model selects/requests
 * TODO should be somehow automatically created in the model but for now this works
 */
export abstract class GenericModel<T> {

    /**
     * override and set to false if model is read only
     */
    canCreate(): boolean {
        return true
    }

    /**
     * create a new instance of a given model
     * do not override on models that cannot create
     * @param name value for field name
     */
    create(name: string): Promise<T> {
        if (!this.canCreate()) {
            throw new Error('Cannot create on this model!')
        }
        return new Promise(() => {
            return undefined
        })
    };

    /**
     * retrieves instances of given model with given query from DB
     * @param query value for standard query parameter of endpoint
     */
    abstract list(query: string): Promise<Array<T>>
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
            return r as unknown as IMealType
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

    canCreate(): boolean {
        return false
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

export class FoodInheritField extends GenericModel<IFoodInheritField> {

    canCreate(): boolean {
        return false
    }

    list(query: string) {
        const api = new ApiApi()
        return api.apiFoodInheritFieldList({}).then(r => {
            if (r) {
                return r
            } else {
                return []
            }
        })
    }
}

export class SupermarketCategory extends GenericModel<ISupermarketCategory> {

    create(name: string) {
        const api = new ApiApi()
        return api.apiSupermarketCategoryCreate({supermarketCategory: {name: name} as ISupermarketCategory}).then(r => {
            return r as unknown as ISupermarketCategory
        })
    }

    list(query: string) {
        const api = new ApiApi()
        return api.apiSupermarketCategoryList({query: query}).then(r => {
            if (r.results) {
                return r.results
            } else {
                return []
            }
        })
    }
}

export class PropertyType extends GenericModel<IPropertyType> {

    create(name: string) {
        const api = new ApiApi()
        return api.apiPropertyTypeCreate({propertyType: {name: name} as IPropertyType}).then(r => {
            return r as unknown as IPropertyType
        })
    }

    list(query: string) {
        const api = new ApiApi()
        return api.apiPropertyTypeList({query: query}).then(r => {
            if (r.results) {
                return r.results
            } else {
                return []
            }
        })
    }
}