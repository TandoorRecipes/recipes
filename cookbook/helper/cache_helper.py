class CacheHelper:
    space = None

    BASE_UNITS_CACHE_KEY = None
    PROPERTY_TYPE_CACHE_KEY = None

    def __init__(self, space):
        self.space = space

        self.BASE_UNITS_CACHE_KEY = f'SPACE_{space.id}_BASE_UNITS'
        self.PROPERTY_TYPE_CACHE_KEY = f'SPACE_{space.id}_PROPERTY_TYPES'
