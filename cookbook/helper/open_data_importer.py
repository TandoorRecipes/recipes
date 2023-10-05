from cookbook.models import (Food, FoodProperty, Property, PropertyType, Supermarket,
                             SupermarketCategory, SupermarketCategoryRelation, Unit, UnitConversion)


class OpenDataImporter:
    request = None
    data = {}
    slug_id_cache = {}
    update_existing = False
    use_metric = True

    def __init__(self, request, data, update_existing=False, use_metric=True):
        self.request = request
        self.data = data
        self.update_existing = update_existing
        self.use_metric = use_metric

    def _update_slug_cache(self, object_class, datatype):
        self.slug_id_cache[datatype] = dict(object_class.objects.filter(space=self.request.space, open_data_slug__isnull=False).values_list('open_data_slug', 'id', ))

    def import_units(self):
        datatype = 'unit'

        insert_list = []
        for u in list(self.data[datatype].keys()):
            insert_list.append(Unit(
                name=self.data[datatype][u]['name'],
                plural_name=self.data[datatype][u]['plural_name'],
                base_unit=self.data[datatype][u]['base_unit'] if self.data[datatype][u]['base_unit'] != '' else None,
                open_data_slug=u,
                space=self.request.space
            ))

        if self.update_existing:
            return Unit.objects.bulk_create(insert_list, update_conflicts=True, update_fields=(
                'name', 'plural_name', 'base_unit', 'open_data_slug'), unique_fields=('space', 'name',))
        else:
            return Unit.objects.bulk_create(insert_list, update_conflicts=True, update_fields=('open_data_slug',), unique_fields=('space', 'name',))

    def import_category(self):
        datatype = 'category'

        insert_list = []
        for k in list(self.data[datatype].keys()):
            insert_list.append(SupermarketCategory(
                name=self.data[datatype][k]['name'],
                open_data_slug=k,
                space=self.request.space
            ))

        return SupermarketCategory.objects.bulk_create(insert_list, update_conflicts=True, update_fields=('open_data_slug',), unique_fields=('space', 'name',))

    def import_property(self):
        datatype = 'property'

        insert_list = []
        for k in list(self.data[datatype].keys()):
            insert_list.append(PropertyType(
                name=self.data[datatype][k]['name'],
                unit=self.data[datatype][k]['unit'],
                open_data_slug=k,
                space=self.request.space
            ))

        return PropertyType.objects.bulk_create(insert_list, update_conflicts=True, update_fields=('open_data_slug',), unique_fields=('space', 'name',))

    def import_supermarket(self):
        datatype = 'store'

        self._update_slug_cache(SupermarketCategory, 'category')
        insert_list = []
        for k in list(self.data[datatype].keys()):
            insert_list.append(Supermarket(
                name=self.data[datatype][k]['name'],
                open_data_slug=k,
                space=self.request.space
            ))

        # always add open data slug if matching supermarket is found, otherwise relation might fail
        supermarkets = Supermarket.objects.bulk_create(insert_list, unique_fields=('space', 'name',), update_conflicts=True, update_fields=('open_data_slug',))
        self._update_slug_cache(Supermarket, 'store')

        insert_list = []
        for k in list(self.data[datatype].keys()):
            relations = []
            order = 0
            for c in self.data[datatype][k]['categories']:
                relations.append(
                    SupermarketCategoryRelation(
                        supermarket_id=self.slug_id_cache[datatype][k],
                        category_id=self.slug_id_cache['category'][c],
                        order=order,
                    )
                )
                order += 1

            SupermarketCategoryRelation.objects.bulk_create(relations, ignore_conflicts=True, unique_fields=('supermarket', 'category',))

        return supermarkets

    def import_food(self):
        identifier_list = []
        datatype = 'food'
        for k in list(self.data[datatype].keys()):
            identifier_list.append(self.data[datatype][k]['name'])
            identifier_list.append(self.data[datatype][k]['plural_name'])

        existing_objects_flat = []
        existing_objects = {}
        for f in Food.objects.filter(space=self.request.space).filter(name__in=identifier_list).values_list('id', 'name', 'plural_name'):
            existing_objects_flat.append(f[1])
            existing_objects_flat.append(f[2])
            existing_objects[f[1]] = f
            existing_objects[f[2]] = f

        self._update_slug_cache(Unit, 'unit')
        self._update_slug_cache(PropertyType, 'property')

        insert_list = []
        update_list = []
        update_field_list = []
        for k in list(self.data[datatype].keys()):
            if not (self.data[datatype][k]['name'] in existing_objects_flat or self.data[datatype][k]['plural_name'] in existing_objects_flat):
                insert_list.append({'data': {
                    'name': self.data[datatype][k]['name'],
                    'plural_name': self.data[datatype][k]['plural_name'] if self.data[datatype][k]['plural_name'] != '' else None,
                    'supermarket_category_id': self.slug_id_cache['category'][self.data[datatype][k]['store_category']],
                    'fdc_id': self.data[datatype][k]['fdc_id'] if self.data[datatype][k]['fdc_id'] != '' else None,
                    'open_data_slug': k,
                    'space': self.request.space.id,
                }})
            else:
                if self.data[datatype][k]['name'] in existing_objects:
                    existing_food_id = existing_objects[self.data[datatype][k]['name']][0]
                else:
                    existing_food_id = existing_objects[self.data[datatype][k]['plural_name']][0]

                if self.update_existing:
                    update_field_list = ['name', 'plural_name', 'preferred_unit_id', 'preferred_shopping_unit_id', 'supermarket_category_id', 'fdc_id', 'open_data_slug', ]
                    update_list.append(Food(
                        id=existing_food_id,
                        name=self.data[datatype][k]['name'],
                        plural_name=self.data[datatype][k]['plural_name'] if self.data[datatype][k]['plural_name'] != '' else None,
                        supermarket_category_id=self.slug_id_cache['category'][self.data[datatype][k]['store_category']],
                        fdc_id=self.data[datatype][k]['fdc_id'] if self.data[datatype][k]['fdc_id'] != '' else None,
                        open_data_slug=k,
                    ))
                else:
                    update_field_list = ['open_data_slug', ]
                    update_list.append(Food(id=existing_food_id, open_data_slug=k, ))

        Food.load_bulk(insert_list, None)
        if len(update_list) > 0:
            Food.objects.bulk_update(update_list, update_field_list)

        self._update_slug_cache(Food, 'food')

        food_property_list = []
        # alias_list = []

        for k in list(self.data[datatype].keys()):
            for fp in self.data[datatype][k]['properties']['type_values']:
                # try catch here because somettimes key "k" is not set for he food cache
                try:
                    food_property_list.append(Property(
                        property_type_id=self.slug_id_cache['property'][fp['property_type']],
                        property_amount=fp['property_value'],
                        import_food_id=self.slug_id_cache['food'][k],
                        space=self.request.space,
                    ))
                except KeyError:
                    print(str(k) + ' is not in self.slug_id_cache["food"]')

        Property.objects.bulk_create(food_property_list, ignore_conflicts=True, unique_fields=('space', 'import_food_id', 'property_type',))

        property_food_relation_list = []
        for p in Property.objects.filter(space=self.request.space, import_food_id__isnull=False).values_list('import_food_id', 'id', ):
            property_food_relation_list.append(Food.properties.through(food_id=p[0], property_id=p[1]))

        FoodProperty.objects.bulk_create(property_food_relation_list, ignore_conflicts=True, unique_fields=('food_id', 'property_id',))

        return insert_list + update_list

    def import_conversion(self):
        datatype = 'conversion'

        insert_list = []
        for k in list(self.data[datatype].keys()):
            # try catch here because sometimes key "k" is not set for he food cache
            try:
                insert_list.append(UnitConversion(
                    base_amount=self.data[datatype][k]['base_amount'],
                    base_unit_id=self.slug_id_cache['unit'][self.data[datatype][k]['base_unit']],
                    converted_amount=self.data[datatype][k]['converted_amount'],
                    converted_unit_id=self.slug_id_cache['unit'][self.data[datatype][k]['converted_unit']],
                    food_id=self.slug_id_cache['food'][self.data[datatype][k]['food']],
                    open_data_slug=k,
                    space=self.request.space,
                    created_by=self.request.user,
                ))
            except KeyError:
                print(str(k) + ' is not in self.slug_id_cache["food"]')

        return UnitConversion.objects.bulk_create(insert_list, ignore_conflicts=True, unique_fields=('space', 'base_unit', 'converted_unit', 'food', 'open_data_slug'))
