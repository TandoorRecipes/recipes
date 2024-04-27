# custom processing for schema
# reason: DRF writable nested needs ID's to decide if a nested object should be created or updated
# the API schema/client make ID's read only by default and strips them entirely in request objects (with COMPONENT_SPLIT_REQUEST enabled)
# change the schema to make IDs optional but writable so they are included in the request

def custom_postprocessing_hook(result, generator, request, public):
    for c in result['components']['schemas'].keys():
        # handle schemas used by the client to do requests on the server
        if 'properties' in result['components']['schemas'][c] and 'id' in result['components']['schemas'][c]['properties']:
            # make ID field not read only so it's not stripped from the request on the client
            result['components']['schemas'][c]['properties']['id']['readOnly'] = False
            # make ID field not required
            if 'required' in result['components']['schemas'][c] and 'id' in result['components']['schemas'][c]['required']:
                result['components']['schemas'][c]['required'].remove('id')

    return result


# TODO remove below once legacy API has been fully deprecated
from drf_spectacular.openapi import AutoSchema  # noqa: E402 isort: skip
import functools  # noqa: E402 isort: skip
import re  # noqa: E402 isort: skip


class LegacySchema(AutoSchema):
    operation_id_base = None

    @functools.cached_property
    def path(self):
        path = re.sub(pattern=self.path_prefix, repl='', string=self.path, flags=re.IGNORECASE)
        # remove path variables
        return re.sub(pattern=r'\{[\w\-]+\}', repl='', string=path)

    def get_operation_id(self):
        """
        Compute an operation ID from the view type and get_operation_id_base method.
        """
        method_name = getattr(self.view, 'action', self.method.lower())
        if self._is_list_view():
            action = 'list'
        elif method_name not in self.method_mapping:
            action = self._to_camel_case(method_name)
        else:
            action = self.method_mapping[self.method.lower()]

        name = self.get_operation_id_base(action)

        return action + name

    def get_operation_id_base(self, action):
        """
        Compute the base part for operation ID from the model, serializer or view name.
        """
        model = getattr(getattr(self.view, 'queryset', None), 'model', None)

        if self.operation_id_base is not None:
            name = self.operation_id_base

        # Try to deduce the ID from the view's model
        elif model is not None:
            name = model.__name__

        # Try with the serializer class name
        elif self.get_serializer() is not None:
            name = self.get_serializer().__class__.__name__
            if name.endswith('Serializer'):
                name = name[:-10]

        # Fallback to the view name
        else:
            name = self.view.__class__.__name__
            if name.endswith('APIView'):
                name = name[:-7]
            elif name.endswith('View'):
                name = name[:-4]

            # Due to camel-casing of classes and `action` being lowercase, apply title in order to find if action truly
            # comes at the end of the name
            if name.endswith(action.title()):  # ListView, UpdateAPIView, ThingDelete ...
                name = name[:-len(action)]

        if action == 'list' and not name.endswith('s'):  # listThings instead of listThing
            name += 's'

        return name

    def get_serializer(self):
        view = self.view

        if not hasattr(view, 'get_serializer'):
            return None

        try:
            return view.get_serializer()
        except Exception:
            return None

    def _to_camel_case(self, snake_str):
        components = snake_str.split('_')
        # We capitalize the first letter of each component except the first one
        # with the 'title' method and join them together.
        return components[0] + ''.join(x.title() for x in components[1:])
