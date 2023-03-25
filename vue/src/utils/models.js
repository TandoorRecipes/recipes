/*
 * Utility CLASS to define model configurations
 * */

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
                tree: {default: undefined},
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
                    sticky_options: [{id: 0, name: "tree_root"}],
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
        tags: [{field: "supermarket_category", label: "name", color: "info"}],
        // REQUIRED: unordered array of fields that can be set during create
        create: {
            // if not defined partialUpdate will use the same parameters, prepending 'id'
            params: [
                [
                    "name",
                    "plural_name",
                    "description",
                    "recipe",
                    "food_onhand",
                    "supermarket_category",
                    "inherit",
                    "inherit_fields",
                    "ignore_shopping",
                    "substitute",
                    "substitute_siblings",
                    "substitute_children",
                    "reset_inherit",
                    "child_inherit_fields",
                ],
            ],

            form: {
                show_help: true,
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: "Name", // form.label always translated in utils.getForm()
                    placeholder: "", // form.placeholder always translated
                    subtitle_field: "full_name",
                },
                plural_name: {
                    form_field: true,
                    type: "text",
                    field: "plural_name",
                    label: "Plural",
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: "Description", // form.label always translated in utils.getForm()
                    placeholder: "",
                },
                recipe: {
                    form_field: true,
                    type: "lookup",
                    field: "recipe",
                    list: "RECIPE",
                    label: "Recipe", // form.label always translated in utils.getForm()
                    help_text: "food_recipe_help", // form.help_text always translated
                },
                onhand: {
                    form_field: true,
                    type: "checkbox",
                    field: "food_onhand",
                    label: "OnHand",
                    help_text: "OnHand_help",
                },
                ignore_shopping: {
                    form_field: true,
                    type: "checkbox",
                    field: "ignore_shopping",
                    label: "Ignore_Shopping",
                    help_text: "ignore_shopping_help",
                },
                shopping_category: {
                    form_field: true,
                    type: "lookup",
                    field: "supermarket_category",
                    list: "SHOPPING_CATEGORY",
                    label: "Shopping_Category",
                    allow_create: true,
                    help_text: "shopping_category_help", // form.help_text always translated
                },
                substitute: {
                    form_field: true,
                    advanced: true,
                    type: "lookup",
                    multiple: true,
                    field: "substitute",
                    list: "FOOD",
                    label: "Substitutes",
                    allow_create: false,
                    help_text: "substitute_help",
                },
                substitute_siblings: {
                    form_field: true,
                    advanced: true,
                    type: "checkbox",
                    field: "substitute_siblings",
                    label: "substitute_siblings", // form.label always translated in utils.getForm()
                    help_text: "substitute_siblings_help", // form.help_text always translated
                    condition: {field: "parent", value: true, condition: "field_exists"},
                },
                substitute_children: {
                    form_field: true,
                    advanced: true,
                    type: "checkbox",
                    field: "substitute_children",
                    label: "substitute_children",
                    help_text: "substitute_children_help",
                    condition: {field: "numchild", value: 0, condition: "gt"},
                },
                inherit_fields: {
                    form_field: true,
                    advanced: true,
                    type: "lookup",
                    multiple: true,
                    field: "inherit_fields",
                    list: "FOOD_INHERIT_FIELDS",
                    label: "InheritFields",
                    condition: {field: "food_children_exist", value: true, condition: "preference_equals"},
                    help_text: "InheritFields_help",
                },
                child_inherit_fields: {
                    form_field: true,
                    advanced: true,
                    type: "lookup",
                    multiple: true,
                    field: "child_inherit_fields",
                    list: "FOOD_INHERIT_FIELDS",
                    label: "ChildInheritFields", // form.label always translated in utils.getForm()
                    condition: {field: "numchild", value: 0, condition: "gt"},
                    help_text: "ChildInheritFields_help", // form.help_text always translated
                },
                reset_inherit: {
                    form_field: true,
                    advanced: true,
                    type: "checkbox",
                    field: "reset_inherit",
                    label: "reset_children",
                    help_text: "reset_children_help",
                    condition: {field: "numchild", value: 0, condition: "gt"},
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
                    label: "Name",
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: "Description",
                    placeholder: "",
                },
                icon: {
                    form_field: true,
                    type: "emoji",
                    field: "icon",
                    label: "Icon",
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
            params: [["name", "plural_name", "description",]],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: "Name",
                    placeholder: "",
                },
                plural_name: {
                    form_field: true,
                    type: "text",
                    field: "plural_name",
                    label: "Plural name",
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: "Description",
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
                    label: "Unit",
                    allow_create: true,
                },
                food: {
                    form_field: true,
                    type: "lookup",
                    field: "food",
                    list: "FOOD",
                    label: "Food", // form.label always translated in utils.getForm()
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
                    label: "Name",
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: "Description",
                    placeholder: "",
                },
                icon: {
                    form_field: true,
                    type: "emoji",
                    field: "icon",
                    label: "Icon",
                },
                filter: {
                    form_field: true,
                    type: "lookup",
                    field: "filter",
                    label: "Custom Filter",
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
                    label: "Name", // form.label always translated in utils.getForm()
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: "Description",
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
                    label: "Name",
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: "Description",
                    placeholder: "",
                },
            },
        },
    }

    static SUPERMARKET = {
        name: "Supermarket",
        apiName: "Supermarket",
        ordered_tags: [{field: "category_to_supermarket", label: "category::name", color: "info"}],
        create: {
            params: [["name", "description", "category_to_supermarket"]],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: "Name",
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: "Description",
                    placeholder: "",
                },
                categories: {
                    form_field: true,
                    type: "lookup",
                    list: "SHOPPING_CATEGORY",
                    list_label: "category::name",
                    ordered: true, // ordered lookups assume working with relation field
                    field: "category_to_supermarket",
                    label: "Categories", // form.label always translated in utils.getForm()
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
            params: [["name", "description", "type", "param_1", "param_2", "param_3", "order", "disabled"]],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: "Name",
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: "Description",
                    placeholder: "",
                },
                type: {
                    form_field: true,
                    type: "choice",
                    options: [
                        {value: "FOOD_ALIAS", text: "Food_Alias"},
                        {value: "UNIT_ALIAS", text: "Unit_Alias"},
                        {value: "KEYWORD_ALIAS", text: "Keyword_Alias"},
                        {value: "DESCRIPTION_REPLACE", text: "Description_Replace"},
                        {value: "INSTRUCTION_REPLACE", text: "Instruction_Replace"},
                    ],
                    field: "type",
                    label: "Type",
                    placeholder: "",
                },
                param_1: {
                    form_field: true,
                    type: "text",
                    field: "param_1",
                    label: {
                        function: "translate",
                        phrase: "parameter_count",
                        params: [
                            {
                                token: "count",
                                attribute: "1",
                            },
                        ],
                    },
                    placeholder: "",
                },
                param_2: {
                    form_field: true,
                    type: "text",
                    field: "param_2",
                    label: {
                        function: "translate",
                        phrase: "parameter_count",
                        params: [
                            {
                                token: "count",
                                attribute: "2",
                            },
                        ],
                    },
                    placeholder: "",
                },
                param_3: {
                    form_field: true,
                    type: "text",
                    field: "param_3",
                    label: {
                        function: "translate",
                        phrase: "parameter_count",
                        params: [
                            {
                                token: "count",
                                attribute: "3",
                            },
                        ],
                    },
                    placeholder: "",
                },
                order: {
                    form_field: true,
                    type: "number",
                    field: "order",
                    label: "Order",
                    placeholder: 0,
                },
                disabled: {
                    form_field: true,
                    type: "checkbox",
                    field: "disabled",
                    label: "Disabled",
                    placeholder: "",
                },
                form_function: "AutomationOrderDefault"
            },

        },
    }

    static UNIT_CONVERSION = {
        name: "Unit Conversion",
        apiName: "UnitConversion",
        paginated: false,
        list: {
            header_component: {
                name: "BetaWarning",
            },
        },
        create: {
            params: [['base_amount', 'base_unit', 'converted_amount', 'converted_unit', 'food']],
            form: {
                // TODO add proper help texts for everything
                base_amount: {
                    form_field: true,
                    type: "text",
                    field: "base_amount",
                    label: "base_amount",
                    placeholder: "",
                },
                base_unit: {
                    form_field: true,
                    type: "lookup",
                    field: "base_unit",
                    list: "UNIT",
                    list_label: "name",
                    label: "Base Unit",
                    multiple: false,
                },
                converted_amount: {
                    form_field: true,
                    type: "text",
                    field: "converted_amount",
                    label: "base_amount",
                    placeholder: "",
                },
                converted_unit: {
                    form_field: true,
                    type: "lookup",
                    field: "converted_unit",
                    list: "UNIT",
                    list_label: "name",
                    label: "Converted Unit",
                    multiple: false,
                },
                food: {
                    form_field: true,
                    type: "lookup",
                    field: "food",
                    list: "FOOD",
                    list_label: "Food",
                    label: "Food",
                    multiple: false,
                },

            },

        },
    }

    static FOOD_PROPERTY_TYPE = {
        name: "Food Property Type",
        apiName: "FoodPropertyType",
        paginated: false,
        list: {
            header_component: {
                name: "BetaWarning",
            },
        },
        create: {
            params: [['name', 'icon', 'unit', 'description']],
            form: {

                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: "Name",
                    placeholder: "",
                },
                icon: {
                    form_field: true,
                    type: "emoji",
                    field: "icon",
                    label: "Icon",
                    placeholder: "",
                },
                unit: {
                    form_field: true,
                    type: "text",
                    field: "unit",
                    label: "Unit",
                    placeholder: "",
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: "Description",
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
                "cookedon",
                "createdon",
                "updatedon",
                "viewedon",
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
        name: "Custom Filter",
        apiName: "CustomFilter",

        create: {
            params: [["name", "search", "shared"]],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: "Name", // form.label always translated in utils.getForm()
                    placeholder: "",
                },

                shared: {
                    form_field: true,
                    type: "lookup",
                    field: "shared",
                    list: "USER",
                    list_label: "display_name",
                    label: "shared_with",
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
        create: {
            params: [["name",]],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: "Name",
                    placeholder: "",
                },
            },
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
                    label: "Name",
                    placeholder: "",
                },
                file: {
                    form_field: true,
                    type: "file",
                    field: "file",
                    label: "File", // form.label always translated in utils.getForm()
                    placeholder: "",
                },
            },
        },
    }

    static INVITE_LINK = {
        name: "InviteLink",
        apiName: "InviteLink",
        paginated: false,
        create: {
            params: [["email", "group", "valid_until", "reusable"]],
            form: {
                email: {
                    form_field: true,
                    type: "text",
                    field: "email",
                    label: "Email",
                    placeholder: "",
                },
                group: {
                    form_field: true,
                    type: "lookup",
                    field: "group",
                    list: "GROUP",
                    list_label: "name",
                    label: "Group",
                    placeholder: "",
                },
                valid_until: {
                    form_field: true,
                    type: "date",
                    field: "valid_until",
                    label: "Valid Until",
                    placeholder: "",
                },
                reusable: {
                    form_field: true,
                    type: "checkbox",
                    field: "reusable",
                    label: "Reusable",
                    help_text: "reusable_help_text",
                    placeholder: "",
                },
            },
        },
    }

    static ACCESS_TOKEN = {
        name: "AccessToken",
        apiName: "AccessToken",
        paginated: false,
        create: {
            params: [["scope", "expires"]],
            form: {
                scope: {
                    form_field: true,
                    type: "text",
                    field: "scope",
                    label: "Scope",
                    placeholder: "",
                },
                expires: {
                    form_field: true,
                    type: "date",
                    field: "expires",
                    label: "expires",
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

    static GROUP = {
        name: "Group",
        apiName: "Group",
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
                        translate: true,
                    },
                ],
            },
            ok_label: {function: "translate", phrase: "Save"},
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
                    translate: true,
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
                        translate: true,
                    },
                ],
            },
            ok_label: {function: "translate", phrase: "Delete"},
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
            query: {default: undefined},
            page: {default: 1},
            pageSize: {default: 25},
        },
    }
    static MERGE = {
        function: "merge",
        params: ["source", "target"],
        config: {
            source: {type: "string"},
            target: {type: "string"},
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
                        translate: true,
                    },
                ],
            },
            ok_label: {function: "translate", phrase: "Merge"},
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
                            translate: true,
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
            source: {type: "string"},
            target: {type: "string"},
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
                        translate: true,
                    },
                ],
            },
            ok_label: {function: "translate", phrase: "Move"},
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
                            translate: true,
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
