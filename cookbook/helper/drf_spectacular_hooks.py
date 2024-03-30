from drf_spectacular.types import OpenApiTypes


def custom_postprocessing_hook(result, generator, request, public):
    for c in result['components']['schemas'].keys():
        if 'properties' in result['components']['schemas'][c] and 'id' in result['components']['schemas'][c]['properties']:
            print('setting non read only for ', c)
            result['components']['schemas'][c]['properties']['id']['readOnly'] = False
        if 'required' in result['components']['schemas'][c] and 'id' in result['components']['schemas'][c]['required']:
            result['components']['schemas'][c]['required'].remove('id')
    return result
