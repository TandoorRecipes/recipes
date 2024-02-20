from rest_framework.schemas.openapi import AutoSchema
from rest_framework.schemas.utils import is_list_view


class QueryParam(object):
    def __init__(self, name, description=None, qtype='string', required=False):
        self.name = name
        self.description = description
        self.qtype = qtype
        self.required = required

    def __str__(self):
        return f'{self.name}, {self.qtype}, {self.description}'


class QueryParamAutoSchema(AutoSchema):
    def get_path_parameters(self, path, method):
        if not is_list_view(path, method, self.view):
            return super().get_path_parameters(path, method)
        parameters = super().get_path_parameters(path, method)
        for q in self.view.query_params:
            parameters.append({
                "name": q.name, "in": "query", "required": q.required,
                "description": q.description,
                'schema': {'type': q.qtype, },
            })

        return parameters


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
            "description": 'Return first level children of {obj} with ID [int].  Integer 0 will return root {obj}s.'.format(
                obj=api_name),
            'schema': {'type': 'integer', },
        })
        parameters.append({
            "name": 'tree', "in": "query", "required": False,
            "description": 'Return all self and children of {} with ID [int].'.format(api_name),
            'schema': {'type': 'integer', },
        })
        return parameters


class FilterSchema(AutoSchema):
    def get_path_parameters(self, path, method):
        if not is_list_view(path, method, self.view):
            return super(FilterSchema, self).get_path_parameters(path, method)

        api_name = path.split('/')[2]
        parameters = super().get_path_parameters(path, method)
        parameters.append({
            "name": 'query', "in": "query", "required": False,
            "description": 'Query string matched against {} name.'.format(api_name),
            'schema': {'type': 'string', },
        })
        return parameters
