/*
* Utility CLASS to define model configurations
* */
import i18n from "@/i18n";

// TODO this needs rethought and simplified
// maybe a function that returns a single dictionary based on action?
export class Models {
    // Arrays correspond to ORDERED list of parameters required by ApiApiFactory
    // Inner arrays are used to construct a dictionary of key:value pairs
    // MODEL configurations will override MODEL_TYPE configurations with will override ACTION configurations

    // MODEL_TYPES - inherited by MODELS, inherits and takes precedence over ACTIONS
    static TREE = {
        'list': {
            'params': ['query', 'root', 'tree', 'page', 'pageSize'],
            'config': {
                'root': {
                    'default': {
                        'function': 'CONDITIONAL',
                        'check': 'query',
                        'operator': 'not_exist',
                        'true': 0,
                        'false': undefined
                        }
                },
                'tree': {'default': undefined},
            },
        },
        'delete': {
            "form": {
                'instruction': {
                    'form_field': true,
                    'type': 'instruction',
                    'function': 'translate',
                    'phrase': "del_confimation_tree",
                    'params':[
                        {
                            'token': 'source',
                            'from':'item1',
                            'attribute': "name"
                        }
                    ]
                }
            }
        },
        'move': {
            'form': {
                'target': {
                    'form_field': true,
                    'type': 'lookup',
                    'field': 'target',
                    'list': 'self',
                    'sticky_options': [{'id': 0,'name': i18n.t('tree_root')}]
                }
            }
        }
    }

    // MODELS - inherits and takes precedence over MODEL_TYPES and ACTIONS
    static FOOD = {
        'name': i18n.t('Food'),              // *OPTIONAL* : parameters will be built model -> model_type -> default
        'apiName': 'Food',                   // *REQUIRED* : the name that is used in api.ts for this model
        'model_type': this.TREE,             // *OPTIONAL* : model specific params for api, if not present will attempt modeltype_create then default_create
        // REQUIRED: unordered array of fields that can be set during create
        'create': {
            // if not defined partialUpdate will use the same parameters, prepending 'id'
            'params': [['name', 'description', 'recipe', 'ignore_shopping', 'supermarket_category']],
            'form': {
                'name': {
                    'form_field': true,
                    'type': 'text',
                    'field': 'name',
                    'label': i18n.t('Name'),
                    'placeholder': ''
                },
                'description': {
                    'form_field': true,
                    'type': 'text',
                    'field': 'description',
                    'label': i18n.t('Description'),
                    'placeholder': ''
                },
                'recipe': {
                    'form_field': true,
                    'type': 'lookup',
                    'field': 'recipe',
                    'list': 'RECIPE',
                    'label': i18n.t('Recipe')
                },
                'shopping': {
                    'form_field': true,
                    'type': 'checkbox',
                    'field': 'ignore_shopping',
                    'label': i18n.t('Ignore_Shopping')
                },
                'shopping_category': {
                    'form_field': true,
                    'type': 'lookup',
                    'field': 'supermarket_category',
                    'list': 'SHOPPING_CATEGORY',
                    'label': i18n.t('Shopping_Category'),
                },
            }
        },

    }
    static KEYWORD = {
        'name': i18n.t('Keyword'),              // *OPTIONAL: parameters will be built model -> model_type -> default
        'apiName': 'Keyword',  
        'model_type': this.TREE,
        'create': {
            // if not defined partialUpdate will use the same parameters, prepending 'id'
            'params': [['name', 'description', 'icon']],
            'form': {
                'name': {
                    'form_field': true,
                    'type': 'text',
                    'field': 'name',
                    'label': i18n.t('Name'),
                    'placeholder': ''
                },
                'description': {
                    'form_field': true,
                    'type': 'text',
                    'field': 'description',
                    'label': i18n.t('Description'),
                    'placeholder': ''
                },
                'icon': {
                    'form_field': true,
                    'type': 'emoji',
                    'field': 'icon',
                    'label': i18n.t('Icon')
                },
            }
        },
    }
    static UNIT = {
        'name': i18n.t('Unit'),
        'apiName': 'Unit', 
        'create': {
            'params': [['name', 'description']],
            'form': {
                'name': {
                    'form_field': true,
                    'type': 'text',
                    'field': 'name',
                    'label': i18n.t('Name'),
                    'placeholder': ''
                },
                'description': {
                    'form_field': true,
                    'type': 'text',
                    'field': 'description',
                    'label': i18n.t('Description'),
                    'placeholder': ''
                }
            }
        },
        'move': false
    }
    static RECIPE = {}
    static SHOPPING_LIST = {}
    static RECIPE_BOOK = {
        'name': i18n.t('Recipe_Book'),
        'apiName': 'RecipeBook',  
    }
    static SHOPPING_CATEGORY = {
        'name': i18n.t('Shopping_Category'),
        'apiName': 'SupermarketCategory', 
    }
    
    static RECIPE = {
        'name': i18n.t('Recipe'),
        'apiName': 'Recipe',
        'list': {
            'params': ['query', 'keywords', 'foods', 'books', 'keywordsOr', 'foodsOr', 'booksOr', 'internal', 'random', '_new', 'page', 'pageSize', 'options'],
            'config': {
                'foods': {'type':'string'},
                'keywords': {'type': 'string'},
                'books': {'type': 'string'},
            }
        },

    }
}


export class Actions {
    static CREATE = {
        "function": "create",
        'form': {
            'title': {
                'function': 'translate',
                'phrase': 'create_title',
                'params' : [
                    {
                        'token': 'type',
                        'from': 'model',
                        'attribute':'name'
                    }
                ],
            },
            'ok_label': i18n.t('Save'),
        }
    }
    static UPDATE = {
        "function": "partialUpdate",
        // special case for update only - updated assumes create form is sufficient, but a different title is required.
        "form_title": {
            'function': 'translate',
            'phrase': 'edit_title',
            'params' : [
                {
                    'token': 'type',
                    'from': 'model',
                    'attribute':'name'
                }
            ],
        },
    }
    static DELETE = {
        "function": "destroy",
        'params': ['id'],
        'form': {
            'title': {
                'function': 'translate',
                'phrase': 'delete_title',
                'params' : [
                    {
                        'token': 'type',
                        'from': 'model',
                        'attribute':'name'
                    }
                ],
            },
            'ok_label': i18n.t('Delete'),
            'instruction': {
                'form_field': true,
                'type': 'instruction',
                'label': {
                    'function': 'translate',
                    'phrase': "delete_confirmation",
                    'params':[
                        {
                            'token': 'source',
                            'from':'item1',
                            'attribute': "name"
                        }
                    ]
                }
            }
        }
    }
    static FETCH = {
        "function": "retrieve",
        'params': ['id']
    }
    static LIST = {
        "function": "list",
        "suffix": "s",
        "params": ['query', 'page', 'pageSize'],
        "config": {
            'query': {'default': undefined},
            'page': {'default': 1},
            'pageSize': {'default': 25}
        }
    }
    static MERGE = {
        "function": "merge",
        'params': ['source', 'target'],
        "config": {
            'source': {'type': 'string'},
            'target': {'type': 'string'}
        },
        'form': {
            'title': {
                'function': 'translate',
                'phrase': 'merge_title',
                'params' : [
                    {
                        'token': 'type',
                        'from': 'model',
                        'attribute':'name'
                    }
                ],
            },
            'ok_label': i18n.t('Merge'),
            'instruction': {
                'form_field': true,
                'type': 'instruction',
                'label': {
                    'function': 'translate',
                    'phrase': "merge_selection",
                    'params':[
                        {
                            'token': 'source',
                            'from':'item1',
                            'attribute': "name"
                        },
                        {
                            'token': 'type',
                            'from':'model',
                            'attribute': "name"
                        },
                    ]
                }
            },
            'target': {
                'form_field': true,
                'type': 'lookup',
                'field': 'target',
                'list': 'self'
            }
        }
    }
    static MOVE = {
        "function": "move",
        'params': ['source', 'target'],
        "config": {
            'source': {'type': 'string'},
            'target': {'type': 'string'}
        },
        'form': {
            'title': {
                'function': 'translate',
                'phrase': 'move_title',
                'params' : [
                    {
                        'token': 'type',
                        'from': 'model',
                        'attribute':'name'
                    }
                ],
            },
            'ok_label': i18n.t('Move'),
            'instruction': {
                'form_field': true,
                'type': 'instruction',
                'label': {
                    'function': 'translate',
                    'phrase': "move_selection",
                    'params':[
                        {
                            'token': 'source',
                            'from':'item1',
                            'attribute': "name"
                        },
                        {
                            'token': 'type',
                            'from':'model',
                            'attribute': "name"
                        },
                    ]
                }
                
            },
            'target': {
                'form_field': true,
                'type': 'lookup',
                'field': 'target',
                'list': 'self'
            }
        }
        
    }
}
