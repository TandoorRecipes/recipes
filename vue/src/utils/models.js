/*
 * Utility CLASS to define model configurations
 * */
import i18n from "@/i18n"

// TODO this needs rethought and simplified
// maybe a function that returns a single dictionary based on action?
export class Models {
    // Arrays correspond to ORDERED list of parameters required by ApiApiFactory
    // Inner arrays are used to construct a dictionary of key:value pairs
    // MODEL configurations will override MODEL_TYPE configurations with will override ACTION configurations

    // MODEL_TYPES - inherited by MODELS, inherits and takes precedence over ACTIONS
    static TREE = {
        list: {
            params: ["query", "root", "tree", "page", "pageSize", "options"],
            config: {
                root: {
                    default: {
                        function: "CONDITIONAL",
                        check: "query",
                        operator: "not_exist",
                        true: 0,
                        false: undefined,
                    },
                },
                tree: { default: undefined },
            },
        },
        delete: {
            form: {
                instruction: {
                    form_field: true,
                    type: "instruction",
                    function: "translate",
                    phrase: "del_confimation_tree",
                    params: [
                        {
                            token: "source",
                            from: "item1",
                            attribute: "name",
                        },
                    ],
                },
            },
        },
        move: {
            form: {
                target: {
                    form_field: true,
                    type: "lookup",
                    field: "target",
                    list: "self",
                    sticky_options: [{ id: 0, name: i18n.t("tree_root") }],
                },
            },
        },
    }

    // MODELS - inherits and takes precedence over MODEL_TYPES and ACTIONS
    static FOOD = {
        name: i18n.t("Food"), // *OPTIONAL* : parameters will be built model -> model_type -> default
        apiName: "Food", // *REQUIRED* : the name that is used in api.ts for this model
        model_type: this.TREE, // *OPTIONAL* : model specific params for api, if not present will attempt modeltype_create then default_create
        paginated: true,
        move: true,
        merge: true,
        badges: {
            linked_recipe: true,
        },
        tags: [{ field: "supermarket_category", label: "name", color: "info" }],
        // REQUIRED: unordered array of fields that can be set during create
        create: {
            // if not defined partialUpdate will use the same parameters, prepending 'id'
            params: [["name", "description", "recipe", "ignore_shopping", "supermarket_category"]],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: i18n.t("Name"),
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: i18n.t("Description"),
                    placeholder: "",
                },
                recipe: {
                    form_field: true,
                    type: "lookup",
                    field: "recipe",
                    list: "RECIPE",
                    label: i18n.t("Recipe"),
                },
                shopping: {
                    form_field: true,
                    type: "checkbox",
                    field: "ignore_shopping",
                    label: i18n.t("Ignore_Shopping"),
                },
                shopping_category: {
                    form_field: true,
                    type: "lookup",
                    field: "supermarket_category",
                    list: "SHOPPING_CATEGORY",
                    label: i18n.t("Shopping_Category"),
                    allow_create: true,
                },
            },
        },
    }

    static KEYWORD = {
        name: i18n.t("Keyword"), // *OPTIONAL: parameters will be built model -> model_type -> default
        apiName: "Keyword",
        model_type: this.TREE,
        paginated: true,
        move: true,
        merge: true,
        badges: {
            icon: true,
        },
        create: {
            // if not defined partialUpdate will use the same parameters, prepending 'id'
            params: [["name", "description", "icon"]],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: i18n.t("Name"),
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: i18n.t("Description"),
                    placeholder: "",
                },
                icon: {
                    form_field: true,
                    type: "emoji",
                    field: "icon",
                    label: i18n.t("Icon"),
                },
            },
        },
    }

    static UNIT = {
        name: i18n.t("Unit"),
        apiName: "Unit",
        paginated: true,
        create: {
            params: [["name", "description"]],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: i18n.t("Name"),
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: i18n.t("Description"),
                    placeholder: "",
                },
            },
        },
        merge: true,
    }

    static SHOPPING_LIST = {
        name: i18n.t("Shopping_list"),
        apiName: "ShoppingListEntry",
    }

    static RECIPE_BOOK = {
        name: i18n.t("Recipe_Book"),
        apiName: "RecipeBook",
        create: {
            params: [["name", "description", "icon"]],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: i18n.t("Name"),
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: i18n.t("Description"),
                    placeholder: "",
                },
                icon: {
                    form_field: true,
                    type: "emoji",
                    field: "icon",
                    label: i18n.t("Icon"),
                },
            },
        },
    }

    static SHOPPING_CATEGORY = {
        name: i18n.t("Shopping_Category"),
        apiName: "SupermarketCategory",
        create: {
            params: [["name", "description"]],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: i18n.t("Name"),
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: i18n.t("Description"),
                    placeholder: "",
                },
            },
        },
    }

    static SHOPPING_CATEGORY_RELATION = {
        name: i18n.t("Shopping_Category_Relation"),
        apiName: "SupermarketCategoryRelation",
        create: {
            params: [["category", "supermarket", "order"]],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: i18n.t("Name"),
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: i18n.t("Description"),
                    placeholder: "",
                },
            },
        },
    }

    static SUPERMARKET = {
        name: i18n.t("Supermarket"),
        apiName: "Supermarket",
        ordered_tags: [{ field: "category_to_supermarket", label: "category::name", color: "info" }],
        create: {
            params: [["name", "description", "category_to_supermarket"]],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: i18n.t("Name"),
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: i18n.t("Description"),
                    placeholder: "",
                },
                categories: {
                    form_field: true,
                    type: "lookup",
                    list: "SHOPPING_CATEGORY",
                    list_label: "category::name",
                    ordered: true, // ordered lookups assume working with relation field
                    field: "category_to_supermarket",
                    label: i18n.t("Categories"),
                    placeholder: "",
                },
            },
            config: {
                function: "SupermarketWithCategories",
            },
        },
        partialUpdate: {
            config: {
                function: "SupermarketWithCategories",
            },
        },
    }

    static AUTOMATION = {
        name: i18n.t("Automation"),
        apiName: "Automation",
        paginated: true,
        list: {
            header_component: {
                name: "BetaWarning",
            },
        },
        create: {
            params: [["name", "description", "type", "param_1", "param_2", "param_3"]],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: i18n.t("Name"),
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: i18n.t("Description"),
                    placeholder: "",
                },
                type: {
                    form_field: true,
                    type: "choice",
                    options: [
                        { value: "FOOD_ALIAS", text: i18n.t("Food_Alias") },
                        { value: "UNIT_ALIAS", text: i18n.t("Unit_Alias") },
                        { value: "KEYWORD_ALIAS", text: i18n.t("Keyword_Alias") },
                    ],
                    field: "type",
                    label: i18n.t("Type"),
                    placeholder: "",
                },
                param_1: {
                    form_field: true,
                    type: "text",
                    field: "param_1",
                    label: i18n.t("Parameter") + " 1",
                    placeholder: "",
                },
                param_2: {
                    form_field: true,
                    type: "text",
                    field: "param_2",
                    label: i18n.t("Parameter") + " 2",
                    placeholder: "",
                },
                param_3: {
                    form_field: true,
                    type: "text",
                    field: "param_3",
                    label: i18n.t("Parameter") + " 3",
                    placeholder: "",
                },
            },
        },
    }

    static RECIPE = {
        name: i18n.t("Recipe"),
        apiName: "Recipe",
        list: {
            params: [
                "query",
                "keywords",
                "foods",
                "units",
                "rating",
                "books",
                "steps",
                "keywordsOr",
                "foodsOr",
                "booksOr",
                "internal",
                "random",
                "_new",
                "page",
                "pageSize",
                "options",
            ],
            config: {
                foods: { type: "string" },
                keywords: { type: "string" },
                books: { type: "string" },
            },
        },
    }

    static STEP = {
        name: i18n.t("Step"),
        apiName: "Step",
        paginated: true,
        list: {
            header_component: {
                name: "BetaWarning",
            },
            params: ["query", "page", "pageSize", "options"],
        },
    }

    static USER_NAME = {
        name: i18n.t("User"),
        apiName: "User",
        list: {
            params: ["filter_list"],
        },
    }

    static MEAL_TYPE = {
        name: i18n.t("Meal_Type"),
        apiName: "MealType",
        list: {
            params: ["filter_list"],
        },
    }

    static MEAL_PLAN = {
        name: i18n.t("Meal_Plan"),
        apiName: "MealPlan",
        list: {
            params: ["options"],
        },
    }

    static USERFILE = {
        name: i18n.t("File"),
        apiName: "UserFile",
        paginated: false,
        list: {
            header_component: {
                name: "StorageQuota",
            },
        },
        create: {
            params: ["name", "file"],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: i18n.t("Name"),
                    placeholder: "",
                },
                file: {
                    form_field: true,
                    type: "file",
                    field: "file",
                    label: i18n.t("File"),
                    placeholder: "",
                },
            },
        },
    }
}

export class Actions {
    static CREATE = {
        function: "create",
        form: {
            title: {
                function: "translate",
                phrase: "create_title",
                params: [
                    {
                        token: "type",
                        from: "model",
                        attribute: "name",
                    },
                ],
            },
            ok_label: i18n.t("Save"),
        },
    }
    static UPDATE = {
        function: "partialUpdate",
        // special case for update only - updated assumes create form is sufficient, but a different title is required.
        form_title: {
            function: "translate",
            phrase: "edit_title",
            params: [
                {
                    token: "type",
                    from: "model",
                    attribute: "name",
                },
            ],
        },
    }
    static DELETE = {
        function: "destroy",
        params: ["id"],
        form: {
            title: {
                function: "translate",
                phrase: "delete_title",
                params: [
                    {
                        token: "type",
                        from: "model",
                        attribute: "name",
                    },
                ],
            },
            ok_label: i18n.t("Delete"),
            instruction: {
                form_field: true,
                type: "instruction",
                label: {
                    function: "translate",
                    phrase: "delete_confirmation",
                    params: [
                        {
                            token: "source",
                            from: "item1",
                            attribute: "name",
                        },
                    ],
                },
            },
        },
    }
    static FETCH = {
        function: "retrieve",
        params: ["id"],
    }
    static LIST = {
        function: "list",
        suffix: "s",
        params: ["query", "page", "pageSize", "options"],
        config: {
            query: { default: undefined },
            page: { default: 1 },
            pageSize: { default: 25 },
        },
    }
    static MERGE = {
        function: "merge",
        params: ["source", "target"],
        config: {
            source: { type: "string" },
            target: { type: "string" },
        },
        form: {
            title: {
                function: "translate",
                phrase: "merge_title",
                params: [
                    {
                        token: "type",
                        from: "model",
                        attribute: "name",
                    },
                ],
            },
            ok_label: i18n.t("Merge"),
            instruction: {
                form_field: true,
                type: "instruction",
                label: {
                    function: "translate",
                    phrase: "merge_selection",
                    params: [
                        {
                            token: "source",
                            from: "item1",
                            attribute: "name",
                        },
                        {
                            token: "type",
                            from: "model",
                            attribute: "name",
                        },
                    ],
                },
            },
            target: {
                form_field: true,
                type: "lookup",
                field: "target",
                list: "self",
            },
        },
    }
    static MOVE = {
        function: "move",
        params: ["source", "target"],
        config: {
            source: { type: "string" },
            target: { type: "string" },
        },
        form: {
            title: {
                function: "translate",
                phrase: "move_title",
                params: [
                    {
                        token: "type",
                        from: "model",
                        attribute: "name",
                    },
                ],
            },
            ok_label: i18n.t("Move"),
            instruction: {
                form_field: true,
                type: "instruction",
                label: {
                    function: "translate",
                    phrase: "move_selection",
                    params: [
                        {
                            token: "source",
                            from: "item1",
                            attribute: "name",
                        },
                        {
                            token: "type",
                            from: "model",
                            attribute: "name",
                        },
                    ],
                },
            },
            target: {
                form_field: true,
                type: "lookup",
                field: "target",
                list: "self",
            },
        },
    }
}
