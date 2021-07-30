from rest_framework.schemas.openapi import AutoSchema
from rest_framework.schemas.utils import is_list_view


# TODO move to separate class to cleanup
class RecipeSchema(AutoSchema):
    def get_path_parameters(self, path, method):
        if not is_list_view(path, method, self.view):
            return super(RecipeSchema, self).get_path_parameters(path, method)

        parameters = super().get_path_parameters(path, method)
        parameters.append({
            "name": 'query', "in": "query", "required": False,
            "description": 'Query string matched (fuzzy) against recipe name. In the future also fulltext search.',
            'schema': {'type': 'string', },
        })
        parameters.append({
            "name": 'keywords', "in": "query", "required": False,
            "description": 'Id of keyword a recipe should have. For multiple repeat parameter.',
            'schema': {'type': 'string', },
        })
        parameters.append({
            "name": 'foods', "in": "query", "required": False,
            "description": 'Id of food a recipe should have. For multiple repeat parameter.',
            'schema': {'type': 'string', },
        })
        parameters.append({
            "name": 'books', "in": "query", "required": False,
            "description": 'Id of book a recipe should have. For multiple repeat parameter.',
            'schema': {'type': 'string', },
        })
        parameters.append({
            "name": 'keywords_or', "in": "query", "required": False,
            "description": 'If recipe should have all (AND) or any (OR) of the provided keywords.',
            'schema': {'type': 'string', },
        })
        parameters.append({
            "name": 'foods_or', "in": "query", "required": False,
            "description": 'If recipe should have all (AND) or any (OR) any of the provided foods.',
            'schema': {'type': 'string', },
        })
        parameters.append({
            "name": 'books_or', "in": "query", "required": False,
            "description": 'If recipe should be in all (AND) or any (OR) any of the provided books.',
            'schema': {'type': 'string', },
        })
        parameters.append({
            "name": 'internal', "in": "query", "required": False,
            "description": 'true or false. If only internal recipes should be returned or not.',
            'schema': {'type': 'string', },
        })
        parameters.append({
            "name": 'random', "in": "query", "required": False,
            "description": 'true or false. returns the results in randomized order.',
            'schema': {'type': 'string', },
        })
        parameters.append({
            "name": 'new', "in": "query", "required": False,
            "description": 'true or false. returns new results first in search results',
            'schema': {'type': 'string', },
        })
        return parameters


# TODO move to separate class to cleanup
class TreeSchema(AutoSchema):

    def get_path_parameters(self, path, method):
        if not is_list_view(path, method, self.view):
            return super(TreeSchema, self).get_path_parameters(path, method)

        api_name = path.split('/')[2]
        parameters = super().get_path_parameters(path, method)
        parameters.append({
            "name": 'query', "in": "query", "required": False,
            "description": 'Query string matched against {} name.'.format(api_name),
            'schema': {'type': 'string', },
        })
        parameters.append({
            "name": 'root', "in": "query", "required": False,
            "description": 'Return first level children of {obj} with ID [int].  Integer 0 will return root {obj}s.'.format(obj=api_name),
            'schema': {'type': 'int', },
        })
        parameters.append({
            "name": 'tree', "in": "query", "required": False,
            "description": 'Return all self and children of {} with ID [int].'.format(api_name),
            'schema': {'type': 'int', },
        })

        return parameters
