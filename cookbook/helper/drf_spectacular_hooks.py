# custom processing for schema
# reason: DRF writable nested needs ID's to decide if a nested object should be created or updated
# the API schema/client make ID's read only by default and strips them entirely in request objects (with COMPONENT_SPLIT_REQUEST enabled)
# change request objects (schema ends with Request) and response objects (just model name) to the following:
#   response objects: id field is required but read only
#   request objects: id field is optional but writable/included

# WARNING: COMPONENT_SPLIT_REQUEST must be enabled, if not schemas might be wrong

def custom_postprocessing_hook(result, generator, request, public):
    for c in result['components']['schemas'].keys():
        # handle schemas used by the client to do requests on the server
        if c.strip().endswith('Request'):
            # check if request schema has a corresponding response schema to avoid changing request schemas for models that end with the word Request
            response_schema = None
            if c.strip().replace('Request', '') in result['components']['schemas'].keys():
                response_schema = c.strip().replace('Request', '')
            elif c.strip().startswith('Patched') and c.strip().replace('Request', '').replace('Patched', '', 1) in result['components']['schemas'].keys():
                response_schema = c.strip().replace('Request', '').replace('Patched', '', 1)

            # if response schema exist update request schema to include writable, optional id
            if response_schema and 'id' in result['components']['schemas'][response_schema]['properties']:
                if 'id' not in result['components']['schemas'][c]['properties']:
                    result['components']['schemas'][c]['properties']['id'] = {'readOnly': False, 'type': 'integer'}
                # this is probably never the case but make sure ID is not required anyway
                if 'required' in result['components']['schemas'][c] and 'id' in result['components']['schemas'][c]['required']:
                    result['components']['schemas'][c]['required'].remove('id')
        # handle all schemas returned by the server to the client
        else:
            if 'properties' in result['components']['schemas'][c] and 'id' in result['components']['schemas'][c]['properties']:
                # make ID field not read only so it's not stripped from the request on the client
                result['components']['schemas'][c]['properties']['id']['readOnly'] = True
                # make ID field required because if an object has an id it should also always be returned
                if 'required' not in result['components']['schemas'][c]:
                    result['components']['schemas'][c]['required'] = ['id']
                else:
                    result['components']['schemas'][c]['required'].append('id')

    return result