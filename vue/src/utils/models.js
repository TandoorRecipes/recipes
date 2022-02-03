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
        name: "Food", // *OPTIONAL* : parameters will be built model -> model_type -> default
        apiName: "Food", // *REQUIRED* : the name that is used in api.ts for this model
        model_type: this.TREE, // *OPTIONAL* : model specific params for api, if not present will attempt modeltype_create then default_create
        paginated: true,
        move: true,
        merge: true,
        shop: true,
        onhand: true,
        badges: {
            linked_recipe: true,
            food_onhand: true,
            shopping: true,
        },
        tags: [{ field: "supermarket_category", label: "name", color: "info" }],
        // REQUIRED: unordered array of fields that can be set during create
        create: {
            // if not defined partialUpdate will use the same parameters, prepending 'id'
            params: [["name", "description", "recipe", "food_onhand", "supermarket_category", "inherit", "inherit_fields", "ignore_shopping"]],

            form: {
                show_help: true,
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: i18n.t("Name"),
                    placeholder: "",
                    subtitle_field: "full_name",
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
                    help_text: i18n.t("food_recipe_help"),
                },
                onhand: {
                    form_field: true,
                    type: "checkbox",
                    field: "food_onhand",
                    label: i18n.t("OnHand"),
                    help_text: i18n.t("OnHand_help"),
                },
                ignore_shopping: {
                    form_field: true,
                    type: "checkbox",
                    field: "ignore_shopping",
                    label: i18n.t("Ignore_Shopping"),
                    help_text: i18n.t("ignore_shopping_help"),
                },
                shopping_category: {
                    form_field: true,
                    type: "lookup",
                    field: "supermarket_category",
                    list: "SHOPPING_CATEGORY",
                    label: i18n.t("Shopping_Category"),
                    allow_create: true,
                    help_text: i18n.t("shopping_category_help"),
                },
                inherit_fields: {
                    form_field: true,
                    type: "lookup",
                    multiple: true,
                    field: "inherit_fields",
                    list: "FOOD_INHERIT_FIELDS",
                    label: i18n.t("InheritFields"),
                    condition: { field: "food_children_exist", value: true, condition: "preference_equals" },
                },
                form_function: "FoodCreateDefault",
            },
        },
        shopping: {
            params: ["id", ["id", "amount", "unit", "_delete"]],
        },
    }
    static FOOD_INHERIT_FIELDS = {
        name: "FoodInherit",
        apiName: "FoodInheritField",
    }

    static KEYWORD = {
        name: "Keyword", // *OPTIONAL: parameters will be built model -> model_type -> default
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
                full_name: {
                    form_field: true,
                    type: "smalltext",
                    field: "full_name",
                },
            },
        },
    }

    static UNIT = {
        name: "Unit",
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
        name: "Shopping_list",
        apiName: "ShoppingListEntry",
        list: {
            params: ["id", "checked", "supermarket", "options"],
        },
        create: {
            params: [["amount", "unit", "food", "checked"]],
            form: {
                unit: {
                    form_field: true,
                    type: "lookup",
                    field: "unit",
                    list: "UNIT",
                    label: i18n.t("Unit"),
                    allow_create: true,
                },
                food: {
                    form_field: true,
                    type: "lookup",
                    field: "food",
                    list: "FOOD",
                    label: i18n.t("Food"),
                    allow_create: true,
                },
            },
        },
    }

    static RECIPE_BOOK = {
        name: "Recipe_Book",
        apiName: "RecipeBook",
        create: {
            params: [["name", "description", "icon", "filter"]],
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
                filter: {
                    form_field: true,
                    type: "lookup",
                    field: "filter",
                    label: i18n.t("Custom Filter"),
                    list: "CUSTOM_FILTER",
                },
            },
        },
    }

    static SHOPPING_CATEGORY = {
        name: "Shopping_Category",
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
        name: "Shopping_Category_Relation",
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
        name: "Supermarket",
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
        name: "Automation",
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
        name: "Recipe",
        apiName: "Recipe",
        list: {
            params: [
                "query",
                "keywords",
                "keywords_or",
                "keywords_and",
                "keywords_or_not",
                "keywords_and_not",
                "foods",
                "foods_or",
                "foods_and",
                "foods_or_not",
                "foods_and_not",
                "units",
                "rating",
                "books",
                "books_or",
                "books_and",
                "books_or_not",
                "books_and_not",
                "internal",
                "random",
                "_new",
                "timescooked",
                "lastcooked",
                "makenow",
                "page",
                "pageSize",
                "options",
            ],
        },
        shopping: {
            params: ["id", ["id", "list_recipe", "ingredients", "servings"]],
        },
    }

    static CUSTOM_FILTER = {
        name: i18n.t("Custom Filter"),
        apiName: "CustomFilter",

        create: {
            params: [["name", "search", "shared"]],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: i18n.t("Name"),
                    placeholder: "",
                },

                shared: {
                    form_field: true,
                    type: "lookup",
                    field: "shared",
                    list: "USER",
                    list_label: "username",
                    label: i18n.t("shared_with"),
                    multiple: true,
                },
            },
        },
    }
    static USER_NAME = {
        name: "User",
        apiName: "User",
        list: {
            params: ["filter_list"],
        },
    }

    static MEAL_TYPE = {
        name: "Meal_Type",
        apiName: "MealType",
        list: {
            params: ["filter_list"],
        },
    }

    static MEAL_PLAN = {
        name: "Meal_Plan",
        apiName: "MealPlan",
        list: {
            params: ["options"],
        },
    }

    static USERFILE = {
        name: "File",
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
    static USER = {
        name: "User",
        apiName: "User",
        paginated: false,
    }

    static STEP = {
        name: "Step",
        apiName: "Step",
        list: {
            params: ["recipe", "query", "page", "pageSize", "options"],
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
    static SHOPPING = {
        function: "shopping",
    }
}
