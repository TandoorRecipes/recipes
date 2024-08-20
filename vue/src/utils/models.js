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
                    "open_data_slug",
                ],
            ],

            form: {
                show_help: true,
                component: "FoodEditor",
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
                open_data_slug: {
                    form_field: true,
                    type: "text",
                    field: "open_data_slug",
                    disabled: true,
                    label: "Open_Data_Slug",
                    help_text: "open_data_help_text",
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
            params: [["name", "description"]],
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
                    optional: true,
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
            params: [["name", "plural_name", "description", "base_unit", "open_data_slug"]],
            form: {
                show_help: true,
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
                    optional: true,
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: "Description",
                    placeholder: "",
                    optional: true,
                },
                base_unit: {
                    form_field: true,
                    type: "choice",
                    options: [
                        {value: "g", text: "g"},
                        {value: "kg", text: "kg"},
                        {value: "ounce", text: "ounce"},
                        {value: "pound", text: "pound"},
                        {value: "ml", text: "ml"},
                        {value: "l", text: "l"},
                        {value: "fluid_ounce", text: "fluid_ounce"},
                        {value: "us_cup", text: "us_cup"},
                        {value: "pint", text: "pint"},
                        {value: "quart", text: "quart"},
                        {value: "gallon", text: "gallon"},
                        {value: "tbsp", text: "tbsp"},
                        {value: "tsp", text: "tsp"},
                        {value: "imperial_fluid_ounce", text: "imperial_fluid_ounce"},
                        {value: "imperial_pint", text: "imperial_pint"},
                        {value: "imperial_quart", text: "imperial_quart"},
                        {value: "imperial_gallon", text: "imperial_gallon"},
                        {value: "imperial_tbsp", text: "imperial_tbsp"},
                        {value: "imperial_tsp", text: "imperial_tsp"},
                    ],
                    field: "base_unit",
                    label: "Base Unit",
                    placeholder: "",
                    optional: true,
                },
                open_data_slug: {
                    form_field: true,
                    type: "text",
                    field: "open_data_slug",
                    disabled: true,
                    label: "Open_Data_Slug",
                    help_text: "open_data_help_text",
                    optional: true,
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
            params: [["name", "description", "filter"]],
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
                    optional: true,
                },

                filter: {
                    form_field: true,
                    type: "lookup",
                    field: "filter",
                    label: "Custom Filter",
                    list: "CUSTOM_FILTER",
                    optional: true,
                },
            },
        },
    }

    static SHOPPING_CATEGORY = {
        name: "Shopping_Category",
        apiName: "SupermarketCategory",
        merge: true,
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
                    optional: true,
                },
                open_data_slug: {
                    form_field: true,
                    type: "text",
                    field: "open_data_slug",
                    disabled: true,
                    label: "Open_Data_Slug",
                    help_text: "open_data_help_text",
                    optional: true,
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
                show_help: true,
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
                    optional: true,
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
                    optional: true,
                },
                open_data_slug: {
                    form_field: true,
                    type: "text",
                    field: "open_data_slug",
                    disabled: true,
                    label: "Open_Data_Slug",
                    help_text: "open_data_help_text",
                    optional: true,
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
            params: ["automation_type", "page", "pageSize", "options"],
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
                    optional: true,
                },
                type: {
                    form_field: true,
                    type: "choice",
                    options: [
                        {value: "FOOD_ALIAS", text: "Food_Alias"},
                        {value: "UNIT_ALIAS", text: "Unit_Alias"},
                        {value: "KEYWORD_ALIAS", text: "Keyword_Alias"},
                        {value: "NAME_REPLACE", text: "Name_Replace"},
                        {value: "DESCRIPTION_REPLACE", text: "Description_Replace"},
                        {value: "INSTRUCTION_REPLACE", text: "Instruction_Replace"},
                        {value: "FOOD_REPLACE", text: "Food_Replace"},
                        {value: "UNIT_REPLACE", text: "Unit_Replace"},
                        {value: "NEVER_UNIT", text: "Never_Unit"},
                        {value: "TRANSPOSE_WORDS", text: "Transpose_Words"},
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
                form_function: "AutomationOrderDefault",
            },
        }
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
            params: [["food", "base_amount", "base_unit", "converted_amount", "converted_unit", "open_data_slug"]],
            form: {
                show_help: true,
                // TODO add proper help texts for everything
                food: {
                    form_field: true,
                    type: "lookup",
                    field: "food",
                    list: "FOOD",
                    list_label: "name",
                    label: "Food",
                    multiple: false,
                },
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
                    label: "base_unit",
                    multiple: false,
                },
                converted_amount: {
                    form_field: true,
                    type: "text",
                    field: "converted_amount",
                    label: "converted_amount",
                    placeholder: "",
                },
                converted_unit: {
                    form_field: true,
                    type: "lookup",
                    field: "converted_unit",
                    list: "UNIT",
                    list_label: "name",
                    label: "converted_unit",
                    multiple: false,
                },
                open_data_slug: {
                    form_field: true,
                    type: "text",
                    field: "open_data_slug",
                    disabled: true,
                    label: "Open_Data_Slug",
                    help_text: "open_data_help_text",
                    optional: true,
                },
            },
        },
    }

    static PROPERTY_TYPE = {
        name: "Property Type",
        apiName: "PropertyType",
        paginated: false,
        list: {
            header_component: {
                name: "BetaWarning",
            },
        },
        create: {
            params: [["name", "unit", "description", "order", "fdc_id"]],
            form: {
                show_help: true,
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: "Name",
                    placeholder: "",
                },

                unit: {
                    form_field: true,
                    type: "text",
                    field: "unit",
                    label: "Unit",
                    placeholder: "",
                    optional: true,
                },
                description: {
                    form_field: true,
                    type: "text",
                    field: "description",
                    label: "Description",
                    placeholder: "",
                    optional: true,
                },
                order: {
                    form_field: true,
                    type: "number",
                    field: "order",
                    label: "Order",
                    placeholder: "",
                    optional: true,
                    help_text: "OrderInformation",
                },
                fdc_id: {
                    form_field: true,
                    type: "choice",
                    options: [
                        {value: 1002, text: "Nitrogen [g] (1002)"},
                        {value: 1003, text: "Protein [g] (1003)"},
                        {value: 1004, text: "Total lipid (fat) [g] (1004)"},
                        {value: 1005, text: "Carbohydrate, by difference [g] (1005)"},
                        {value: 1007, text: "Ash [g] (1007)"},
                        {value: 1008, text: "Energy [kcal] (1008)"},
                        {value: 1009, text: "Starch [g] (1009)"},
                        {value: 1010, text: "Sucrose [g] (1010)"},
                        {value: 1011, text: "Glucose [g] (1011)"},
                        {value: 1012, text: "Fructose [g] (1012)"},
                        {value: 1013, text: "Lactose [g] (1013)"},
                        {value: 1014, text: "Maltose [g] (1014)"},
                        {value: 1024, text: "Specific Gravity [sp gr] (1024)"},
                        {value: 1032, text: "Citric acid [mg] (1032)"},
                        {value: 1039, text: "Malic acid [mg] (1039)"},
                        {value: 1041, text: "Oxalic acid [mg] (1041)"},
                        {value: 1043, text: "Pyruvic acid [mg] (1043)"},
                        {value: 1044, text: "Quinic acid [mg] (1044)"},
                        {value: 1050, text: "Carbohydrate, by summation [g] (1050)"},
                        {value: 1051, text: "Water [g] (1051)"},
                        {value: 1062, text: "Energy [kJ] (1062)"},
                        {value: 1063, text: "Sugars, Total [g] (1063)"},
                        {value: 1075, text: "Galactose [g] (1075)"},
                        {value: 1076, text: "Raffinose [g] (1076)"},
                        {value: 1077, text: "Stachyose [g] (1077)"},
                        {value: 1079, text: "Fiber, total dietary [g] (1079)"},
                        {value: 1082, text: "Fiber, soluble [g] (1082)"},
                        {value: 1084, text: "Fiber, insoluble [g] (1084)"},
                        {value: 1085, text: "Total fat (NLEA) [g] (1085)"},
                        {value: 1087, text: "Calcium, Ca [mg] (1087)"},
                        {value: 1089, text: "Iron, Fe [mg] (1089)"},
                        {value: 1090, text: "Magnesium, Mg [mg] (1090)"},
                        {value: 1091, text: "Phosphorus, P [mg] (1091)"},
                        {value: 1092, text: "Potassium, K [mg] (1092)"},
                        {value: 1093, text: "Sodium, Na [mg] (1093)"},
                        {value: 1094, text: "Sulfur, S [mg] (1094)"},
                        {value: 1095, text: "Zinc, Zn [mg] (1095)"},
                        {value: 1097, text: "Cobalt, Co [Âµg] (1097)"},
                        {value: 1098, text: "Copper, Cu [mg] (1098)"},
                        {value: 1100, text: "Iodine, I [Âµg] (1100)"},
                        {value: 1101, text: "Manganese, Mn [mg] (1101)"},
                        {value: 1102, text: "Molybdenum, Mo [Âµg] (1102)"},
                        {value: 1103, text: "Selenium, Se [Âµg] (1103)"},
                        {value: 1105, text: "Retinol [Âµg] (1105)"},
                        {value: 1106, text: "Vitamin A, RAE [Âµg] (1106)"},
                        {value: 1107, text: "Carotene, beta [Âµg] (1107)"},
                        {value: 1108, text: "Carotene, alpha [Âµg] (1108)"},
                        {value: 1109, text: "Vitamin E (alpha-tocopherol) [mg] (1109)"},
                        {value: 1110, text: "Vitamin D (D2 + D3), International Units [IU] (1110)"},
                        {value: 1111, text: "Vitamin D2 (ergocalciferol) [Âµg] (1111)"},
                        {value: 1112, text: "Vitamin D3 (cholecalciferol) [Âµg] (1112)"},
                        {value: 1113, text: "25-hydroxycholecalciferol [Âµg] (1113)"},
                        {value: 1114, text: "Vitamin D (D2 + D3) [Âµg] (1114)"},
                        {value: 1116, text: "Phytoene [Âµg] (1116)"},
                        {value: 1117, text: "Phytofluene [Âµg] (1117)"},
                        {value: 1118, text: "Carotene, gamma [Âµg] (1118)"},
                        {value: 1119, text: "Zeaxanthin [Âµg] (1119)"},
                        {value: 1120, text: "Cryptoxanthin, beta [Âµg] (1120)"},
                        {value: 1121, text: "Lutein [Âµg] (1121)"},
                        {value: 1122, text: "Lycopene [Âµg] (1122)"},
                        {value: 1123, text: "Lutein + zeaxanthin [Âµg] (1123)"},
                        {value: 1125, text: "Tocopherol, beta [mg] (1125)"},
                        {value: 1126, text: "Tocopherol, gamma [mg] (1126)"},
                        {value: 1127, text: "Tocopherol, delta [mg] (1127)"},
                        {value: 1128, text: "Tocotrienol, alpha [mg] (1128)"},
                        {value: 1129, text: "Tocotrienol, beta [mg] (1129)"},
                        {value: 1130, text: "Tocotrienol, gamma [mg] (1130)"},
                        {value: 1131, text: "Tocotrienol, delta [mg] (1131)"},
                        {value: 1137, text: "Boron, B [Âµg] (1137)"},
                        {value: 1146, text: "Nickel, Ni [Âµg] (1146)"},
                        {value: 1159, text: "cis-beta-Carotene [Âµg] (1159)"},
                        {value: 1160, text: "cis-Lycopene [Âµg] (1160)"},
                        {value: 1161, text: "cis-Lutein/Zeaxanthin [Âµg] (1161)"},
                        {value: 1162, text: "Vitamin C, total ascorbic acid [mg] (1162)"},
                        {value: 1165, text: "Thiamin [mg] (1165)"},
                        {value: 1166, text: "Riboflavin [mg] (1166)"},
                        {value: 1167, text: "Niacin [mg] (1167)"},
                        {value: 1170, text: "Pantothenic acid [mg] (1170)"},
                        {value: 1175, text: "Vitamin B-6 [mg] (1175)"},
                        {value: 1176, text: "Biotin [Âµg] (1176)"},
                        {value: 1177, text: "Folate, total [Âµg] (1177)"},
                        {value: 1178, text: "Vitamin B-12 [Âµg] (1178)"},
                        {value: 1180, text: "Choline, total [mg] (1180)"},
                        {value: 1183, text: "Vitamin K (Menaquinone-4) [Âµg] (1183)"},
                        {value: 1184, text: "Vitamin K (Dihydrophylloquinone) [Âµg] (1184)"},
                        {value: 1185, text: "Vitamin K (phylloquinone) [Âµg] (1185)"},
                        {value: 1188, text: "5-methyl tetrahydrofolate (5-MTHF) [Âµg] (1188)"},
                        {value: 1191, text: "10-Formyl folic acid (10HCOFA) [Âµg] (1191)"},
                        {value: 1192, text: "5-Formyltetrahydrofolic acid (5-HCOH4 [Âµg] (1192)"},
                        {value: 1194, text: "Choline, free [mg] (1194)"},
                        {value: 1195, text: "Choline, from phosphocholine [mg] (1195)"},
                        {value: 1196, text: "Choline, from phosphotidyl choline [mg] (1196)"},
                        {value: 1197, text: "Choline, from glycerophosphocholine [mg] (1197)"},
                        {value: 1198, text: "Betaine [mg] (1198)"},
                        {value: 1199, text: "Choline, from sphingomyelin [mg] (1199)"},
                        {value: 1210, text: "Tryptophan [g] (1210)"},
                        {value: 1211, text: "Threonine [g] (1211)"},
                        {value: 1212, text: "Isoleucine [g] (1212)"},
                        {value: 1213, text: "Leucine [g] (1213)"},
                        {value: 1214, text: "Lysine [g] (1214)"},
                        {value: 1215, text: "Methionine [g] (1215)"},
                        {value: 1216, text: "Cystine [g] (1216)"},
                        {value: 1217, text: "Phenylalanine [g] (1217)"},
                        {value: 1218, text: "Tyrosine [g] (1218)"},
                        {value: 1219, text: "Valine [g] (1219)"},
                        {value: 1220, text: "Arginine [g] (1220)"},
                        {value: 1221, text: "Histidine [g] (1221)"},
                        {value: 1222, text: "Alanine [g] (1222)"},
                        {value: 1223, text: "Aspartic acid [g] (1223)"},
                        {value: 1224, text: "Glutamic acid [g] (1224)"},
                        {value: 1225, text: "Glycine [g] (1225)"},
                        {value: 1226, text: "Proline [g] (1226)"},
                        {value: 1227, text: "Serine [g] (1227)"},
                        {value: 1228, text: "Hydroxyproline [g] (1228)"},
                        {value: 1232, text: "Cysteine [g] (1232)"},
                        {value: 1253, text: "Cholesterol [mg] (1253)"},
                        {value: 1257, text: "Fatty acids, total trans [g] (1257)"},
                        {value: 1258, text: "Fatty acids, total saturated [g] (1258)"},
                        {value: 1259, text: "SFA 4:0 [g] (1259)"},
                        {value: 1260, text: "SFA 6:0 [g] (1260)"},
                        {value: 1261, text: "SFA 8:0 [g] (1261)"},
                        {value: 1262, text: "SFA 10:0 [g] (1262)"},
                        {value: 1263, text: "SFA 12:0 [g] (1263)"},
                        {value: 1264, text: "SFA 14:0 [g] (1264)"},
                        {value: 1265, text: "SFA 16:0 [g] (1265)"},
                        {value: 1266, text: "SFA 18:0 [g] (1266)"},
                        {value: 1267, text: "SFA 20:0 [g] (1267)"},
                        {value: 1268, text: "MUFA 18:1 [g] (1268)"},
                        {value: 1269, text: "PUFA 18:2 [g] (1269)"},
                        {value: 1270, text: "PUFA 18:3 [g] (1270)"},
                        {value: 1271, text: "PUFA 20:4 [g] (1271)"},
                        {value: 1272, text: "PUFA 22:6 n-3 (DHA) [g] (1272)"},
                        {value: 1273, text: "SFA 22:0 [g] (1273)"},
                        {value: 1276, text: "PUFA 18:4 [g] (1276)"},
                        {value: 1277, text: "MUFA 20:1 [g] (1277)"},
                        {value: 1278, text: "PUFA 20:5 n-3 (EPA) [g] (1278)"},
                        {value: 1279, text: "MUFA 22:1 [g] (1279)"},
                        {value: 1280, text: "PUFA 22:5 n-3 (DPA) [g] (1280)"},
                        {value: 1281, text: "TFA 14:1 t [g] (1281)"},
                        {value: 1284, text: "Ergosterol [mg] (1284)"},
                        {value: 1285, text: "Stigmasterol [mg] (1285)"},
                        {value: 1286, text: "Campesterol [mg] (1286)"},
                        {value: 1287, text: "Brassicasterol [mg] (1287)"},
                        {value: 1288, text: "Beta-sitosterol [mg] (1288)"},
                        {value: 1289, text: "Campestanol [mg] (1289)"},
                        {value: 1292, text: "Fatty acids, total monounsaturated [g] (1292)"},
                        {value: 1293, text: "Fatty acids, total polyunsaturated [g] (1293)"},
                        {value: 1294, text: "Beta-sitostanol [mg] (1294)"},
                        {value: 1296, text: "Delta-5-avenasterol [mg] (1296)"},
                        {value: 1298, text: "Phytosterols, other [mg] (1298)"},
                        {value: 1299, text: "SFA 15:0 [g] (1299)"},
                        {value: 1300, text: "SFA 17:0 [g] (1300)"},
                        {value: 1301, text: "SFA 24:0 [g] (1301)"},
                        {value: 1303, text: "TFA 16:1 t [g] (1303)"},
                        {value: 1304, text: "TFA 18:1 t [g] (1304)"},
                        {value: 1305, text: "TFA 22:1 t [g] (1305)"},
                        {value: 1306, text: "TFA 18:2 t not further defined [g] (1306)"},
                        {value: 1311, text: "PUFA 18:2 CLAs [g] (1311)"},
                        {value: 1312, text: "MUFA 24:1 c [g] (1312)"},
                        {value: 1313, text: "PUFA 20:2 n-6 c,c [g] (1313)"},
                        {value: 1314, text: "MUFA 16:1 c [g] (1314)"},
                        {value: 1315, text: "MUFA 18:1 c [g] (1315)"},
                        {value: 1316, text: "PUFA 18:2 n-6 c,c [g] (1316)"},
                        {value: 1317, text: "MUFA 22:1 c [g] (1317)"},
                        {value: 1321, text: "PUFA 18:3 n-6 c,c,c [g] (1321)"},
                        {value: 1323, text: "MUFA 17:1 [g] (1323)"},
                        {value: 1325, text: "PUFA 20:3 [g] (1325)"},
                        {value: 1329, text: "Fatty acids, total trans-monoenoic [g] (1329)"},
                        {value: 1330, text: "Fatty acids, total trans-dienoic [g] (1330)"},
                        {value: 1331, text: "Fatty acids, total trans-polyenoic [g] (1331)"},
                        {value: 1333, text: "MUFA 15:1 [g] (1333)"},
                        {value: 1334, text: "PUFA 22:2 [g] (1334)"},
                        {value: 1335, text: "SFA 11:0 [g] (1335)"},
                        {value: 1340, text: "Daidzein [mg] (1340)"},
                        {value: 1341, text: "Genistein [mg] (1341)"},
                        {value: 1404, text: "PUFA 18:3 n-3 c,c,c (ALA) [g] (1404)"},
                        {value: 1405, text: "PUFA 20:3 n-3 [g] (1405)"},
                        {value: 1406, text: "PUFA 20:3 n-6 [g] (1406)"},
                        {value: 1409, text: "PUFA 18:3i [g] (1409)"},
                        {value: 1411, text: "PUFA 22:4 [g] (1411)"},
                        {value: 1414, text: "PUFA 20:3 n-9 [g] (1414)"},
                        {value: 2000, text: "Sugars, total including NLEA [g] (2000)"},
                        {value: 2003, text: "SFA 5:0 [g] (2003)"},
                        {value: 2004, text: "SFA 7:0 [g] (2004)"},
                        {value: 2005, text: "SFA 9:0 [g] (2005)"},
                        {value: 2006, text: "SFA 21:0 [g] (2006)"},
                        {value: 2007, text: "SFA 23:0 [g] (2007)"},
                        {value: 2008, text: "MUFA 12:1 [g] (2008)"},
                        {value: 2009, text: "MUFA 14:1 c [g] (2009)"},
                        {value: 2010, text: "MUFA 17:1 c [g] (2010)"},
                        {value: 2012, text: "MUFA 20:1 c [g] (2012)"},
                        {value: 2013, text: "TFA 20:1 t [g] (2013)"},
                        {value: 2014, text: "MUFA 22:1 n-9 [g] (2014)"},
                        {value: 2015, text: "MUFA 22:1 n-11 [g] (2015)"},
                        {value: 2016, text: "PUFA 18:2 c [g] (2016)"},
                        {value: 2017, text: "TFA 18:2 t [g] (2017)"},
                        {value: 2018, text: "PUFA 18:3 c [g] (2018)"},
                        {value: 2019, text: "TFA 18:3 t [g] (2019)"},
                        {value: 2020, text: "PUFA 20:3 c [g] (2020)"},
                        {value: 2021, text: "PUFA 22:3 [g] (2021)"},
                        {value: 2022, text: "PUFA 20:4c [g] (2022)"},
                        {value: 2023, text: "PUFA 20:5c [g] (2023)"},
                        {value: 2024, text: "PUFA 22:5 c [g] (2024)"},
                        {value: 2025, text: "PUFA 22:6 c [g] (2025)"},
                        {value: 2026, text: "PUFA 20:2 c [g] (2026)"},
                        {value: 2028, text: "trans-beta-Carotene [Âµg] (2028)"},
                        {value: 2029, text: "trans-Lycopene [Âµg] (2029)"},
                        {value: 2032, text: "Cryptoxanthin, alpha [Âµg] (2032)"},
                        {value: 2033, text: "Total dietary fiber (AOAC 2011.25) [g] (2033)"},
                        {value: 2038, text: "High Molecular Weight Dietary Fiber (HMWDF) [g] (2038)"},
                        {value: 2047, text: "Energy (Atwater General Factors) [kcal] (2047)"},
                        {value: 2048, text: "Energy (Atwater Specific Factors) [kcal] (2048)"},
                        {value: 2049, text: "Daidzin [mg] (2049)"},
                        {value: 2050, text: "Genistin [mg] (2050)"},
                        {value: 2051, text: "Glycitin [mg] (2051)"},
                        {value: 2052, text: "Delta-7-Stigmastenol [mg] (2052)"},
                        {value: 2053, text: "Stigmastadiene [mg] (2053)"},
                        {value: 2057, text: "Ergothioneine [mg] (2057)"},
                        {value: 2058, text: "Beta-glucan [g] (2058)"},
                        {value: 2059, text: "Vitamin D4 [Âµg] (2059)"},
                        {value: 2060, text: "Ergosta-7-enol [mg] (2060)"},
                        {value: 2061, text: " Ergosta-7,22-dienol [mg] (2061)"},
                        {value: 2062, text: " Ergosta-5,7-dienol [mg] (2062)"},
                        {value: 2063, text: "Verbascose [g] (2063)"},
                        {value: 2065, text: "Low Molecular Weight Dietary Fiber (LMWDF) [g] (2065)"},
                        {value: 2066, text: "Vitamin A [mg] (2066)"},
                        {value: 2069, text: "Glutathione [mg] (2069)"}
                    ],
                    field: "fdc_id",
                    label: "FDC_ID",
                    help_text: "FDC_ID_help",
                    optional: true,
                },
                open_data_slug: {
                    form_field: true,
                    type: "text",
                    field: "open_data_slug",
                    disabled: true,
                    label: "Open_Data_Slug",
                    help_text: "open_data_help_text",
                    optional: true,
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
        paginated: true,
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
        list: {
            params: ["page", "pageSize", "options"],
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
            params: [["name", "color", "default"]],
            form: {
                name: {
                    form_field: true,
                    type: "text",
                    field: "name",
                    label: "Name",
                    placeholder: "",
                },
                color: {
                    form_field: true,
                    type: "color",
                    field: "color",
                    label: "Color",
                    placeholder: "",
                },
                default: {
                    form_field: true,
                    type: "checkbox",
                    field: "default",
                    label: "Default",
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
            params: [["email", "group", "valid_until", "reusable", "internal_note"]],
            form: {
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
                email: {
                    form_field: true,
                    type: "text",
                    field: "email",
                    label: "Email",
                    placeholder: "",
                    optional: true,
                },
                reusable: {
                    form_field: true,
                    type: "checkbox",
                    field: "reusable",
                    label: "Reusable",
                    help_text: "reusable_help_text",
                    placeholder: "",
                },
                internal_note: {
                    form_field: true,
                    type: "textarea",
                    field: "internal_note",
                    label: "Note",
                    placeholder: "",
                    optional: true,
                },
                form_function: "InviteLinkDefaultValid",
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
        paginated: true,
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
