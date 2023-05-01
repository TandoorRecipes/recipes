from django.db.models import Q

from cookbook.models import Unit, SupermarketCategory, FoodProperty, FoodPropertyType, Supermarket, SupermarketCategoryRelation, Food, Automation


class OpenDataImporter:
    request = None
    data = {}
    slug_id_cache = {}

    def __init__(self, request, data):
        self.request = request
        self.data = data

    def _update_slug_cache(self, object_class, datatype):
        self.slug_id_cache[datatype] = dict(object_class.objects.filter(space=self.request.space, open_data_slug__isnull=False).values_list('open_data_slug', 'id', ))

    def import_units(self):
        unit_name_list = []
        for u in list(self.data['unit'].keys()):
            unit_name_list.append(self.data['unit'][u]['name'])
            unit_name_list.append(self.data['unit'][u]['plural_name'])

        existing_units = Unit.objects.filter(space=self.request.space).filter(Q(name__in=unit_name_list) | Q(plural_name__in=unit_name_list)).values_list('name', 'plural_name')
        existing_units = [item for sublist in existing_units for item in sublist]

        insert_list = []
        for u in list(self.data['unit'].keys()):
            if not (self.data['unit'][u]['name'] in existing_units or self.data['unit'][u]['plural_name'] in existing_units):
                insert_list.append(Unit(
                    name=self.data['unit'][u]['name'],
                    plural_name=self.data['unit'][u]['plural_name'],
                    base_unit=self.data['unit'][u]['base_unit'] if self.data['unit'][u]['base_unit'] != '' else None,
                    open_data_slug=u,
                    space=self.request.space
                ))

        Unit.objects.bulk_create(insert_list)
        return len(insert_list)

    def import_category(self):
        identifier_list = []
        datatype = 'category'
        for k in list(self.data[datatype].keys()):
            identifier_list.append(self.data[datatype][k]['name'])

        existing_objects = SupermarketCategory.objects.filter(space=self.request.space).filter(name__in=identifier_list).values_list('name', flat=True)

        insert_list = []
        for k in list(self.data[datatype].keys()):
            if not (self.data[datatype][k]['name'] in existing_objects):
                insert_list.append(SupermarketCategory(
                    name=self.data[datatype][k]['name'],
                    open_data_slug=k,
                    space=self.request.space
                ))

        SupermarketCategory.objects.bulk_create(insert_list)
        return len(insert_list)

    def import_property(self):
        identifier_list = []
        datatype = 'property'
        for k in list(self.data[datatype].keys()):
            identifier_list.append(self.data[datatype][k]['name'])

        existing_objects = FoodPropertyType.objects.filter(space=self.request.space).filter(name__in=identifier_list).values_list('name', flat=True)

        insert_list = []
        for k in list(self.data[datatype].keys()):
            if not (self.data[datatype][k]['name'] in existing_objects):
                insert_list.append(FoodPropertyType(
                    name=self.data[datatype][k]['name'],
                    unit=self.data[datatype][k]['unit'],
                    open_data_slug=k,
                    space=self.request.space
                ))

        FoodPropertyType.objects.bulk_create(insert_list)
        return len(insert_list)

    def import_supermarket(self):
        identifier_list = []
        datatype = 'supermarket'
        for k in list(self.data[datatype].keys()):
            identifier_list.append(self.data[datatype][k]['name'])

        existing_objects = Supermarket.objects.filter(space=self.request.space).filter(name__in=identifier_list).values_list('name', flat=True)

        self._update_slug_cache(SupermarketCategory, 'category')

        insert_list = []
        for k in list(self.data[datatype].keys()):
            if not (self.data[datatype][k]['name'] in existing_objects):  # TODO on large datasets see if bulk creating supermarkets and then relations as well is better
                supermarket = Supermarket.objects.create(
                    name=self.data[datatype][k]['name'],
                    open_data_slug=k,
                    space=self.request.space
                )

                relations = []
                order = 0
                for c in self.data[datatype][k]['categories']:
                    relations.append(
                        SupermarketCategoryRelation(
                            supermarket=supermarket,
                            category_id=self.slug_id_cache['category'][c],
                            order=order,
                        )
                    )
                    order += 1

                SupermarketCategoryRelation.objects.bulk_create(relations)

        return len(insert_list)

    def import_food(self, metric=True):
        identifier_list = []
        datatype = 'food'
        for k in list(self.data[datatype].keys()):
            identifier_list.append(self.data[datatype][k]['name'])
            identifier_list.append(self.data[datatype][k]['plural_name'])

        existing_objects = Food.objects.filter(space=self.request.space).filter(name__in=identifier_list).values_list('name', flat=True)

        self._update_slug_cache(Unit, 'unit')
        self._update_slug_cache(FoodPropertyType, 'property')

        pref_unit_key = 'preferred_unit_metric'
        pref_shopping_unit_key = 'preferred_packaging_unit_metric'
        if not metric:
            pref_unit_key = 'preferred_unit_imperial'
            pref_shopping_unit_key = 'preferred_packaging_unit_imperial'

        insert_list = []

        for k in list(self.data[datatype].keys()):
            if not (self.data[datatype][k]['name'] in existing_objects):
                insert_list.append(Food(
                    name=self.data[datatype][k]['name'],
                    plural_name=self.data[datatype][k]['plural_name'] if self.data[datatype][k]['plural_name'] != '' else None,
                    preferred_unit_id=self.slug_id_cache['unit'][self.data[datatype][k][pref_unit_key]],
                    preferred_shopping_unit_id=self.slug_id_cache['unit'][self.data[datatype][k][pref_shopping_unit_key]],
                    supermarket_category_id=self.slug_id_cache['category'][self.data[datatype][k]['supermarket_category']],
                    fdc_id=self.data[datatype][k]['fdc_id'] if self.data[datatype][k]['fdc_id'] != '' else None,
                    open_data_slug=k,
                    space=self.request.space,
                ))

        Food.load_bulk(insert_list, None)

        self._update_slug_cache(Food, 'food')

        food_property_list = []
        alias_list = []
        for k in list(self.data[datatype].keys()):
            for fp in self.data[datatype][k]['properties']['type_values']:
                food_property_list.append(FoodProperty(
                    food_id=self.slug_id_cache['food'][k],
                    food_amount=self.data[datatype][k]['properties']['food_amount'],
                    food_unit_id=self.slug_id_cache['unit'][self.data[datatype][k]['properties']['food_unit']],
                    property_type_id=self.slug_id_cache['property'][fp['property_type']],
                    property_amount=fp['property_value'],
                ))

            for a in self.data[datatype][k]['alias']:
                alias_list.append(Automation(
                    param_1=a,
                    param_2=self.data[datatype][k]['name']
                ))

        FoodProperty.objects.bulk_create(food_property_list)
        Automation.objects.bulk_create(alias_list)
        return len(insert_list)
