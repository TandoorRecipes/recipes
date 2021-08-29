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
        }
    }

    // MODELS - inherits and takes precedence over MODEL_TYPES and ACTIONS
    static FOOD = {
        'name': 'Food',                  // *OPTIONAL: parameters will be built model -> model_type -> default
        'model_type': this.TREE,              // *OPTIONAL* model specific params for api, if not present will attempt modeltype_create then default_create
        // REQUIRED: unordered array of fields that can be set during create
        'create': {
            // if not defined partialUpdate will use the same parameters, prepending 'id'
            'params': [['name', 'description', 'recipe', 'ignore_shopping', 'supermarket_category']]
        },

    }
    static KEYWORD = {}
    static UNIT = {}
    static RECIPE = {}
    static SHOPPING_LIST = {}
    static RECIPE = {
        'name': 'Recipe',
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
        "function": "create"
    }
    static UPDATE = {
        "function": "partialUpdate",
    }
    static DELETE = {
        "function": "destroy",
        'params': ['id']
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
            'query': {'default':undefined},
            'page': {'default': 1},
            'pageSize': {'default': 25}
        }

    }
    static MERGE = {
        "function": "merge",
        'params': ['source', 'target'],
        "config": {
            'source': {'type':'string'},
            'target': {'type': 'string'}
        }
    }
    static MOVE = {
        "function": "move",
        'params': ['source', 'target'],
        "config": {
            'source': {'type':'string'},
            'target': {'type': 'string'}
        }
    }
}
