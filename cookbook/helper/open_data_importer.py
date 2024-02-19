from cookbook.models import (Food, FoodProperty, Property, PropertyType, Supermarket,
                             SupermarketCategory, SupermarketCategoryRelation, Unit, UnitConversion)
import re


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

    @staticmethod
    def _is_obj_identical(field_list, obj, existing_obj):
        """
        checks if the obj meant for import is identical to an already existing one
        :param field_list: list of field names to check
        :type field_list: list[str]
        :param obj: object meant for import
        :type obj: Object
        :param existing_obj: object already in DB
        :type existing_obj: Object
        :return: if objects are identical
        :rtype: bool
        """
        for field in field_list:
            if getattr(obj, field) != existing_obj[field]:
                return False
        return True

    @staticmethod
    def _merge_if_conflicting(model_type, obj, existing_data_slugs, existing_data_names):
        """
        sometimes there might be two objects conflicting for open data import (one has the slug, the other the name)
        this function checks if that is the case and merges the two objects if possible
        :param model_type: type of model to check/merge
        :type model_type: Model
        :param obj: object that should be created/updated
        :type obj: Model
        :param existing_data_slugs: dict of open data slugs mapped to objects
        :type existing_data_slugs: dict
        :param existing_data_names: dict of names mapped to objects
        :type existing_data_names: dict
        :return: true if merge was successful or not necessary else false
        :rtype: bool
        """
        if obj.open_data_slug in existing_data_slugs and obj.name in existing_data_names and existing_data_slugs[obj.open_data_slug]['pk'] != existing_data_names[obj.name]['pk']:
            try:
                source_obj = model_type.objects.get(pk=existing_data_slugs[obj.open_data_slug]['pk'])
                del existing_data_slugs[obj.open_data_slug]
                source_obj.merge_into(model_type.objects.get(pk=existing_data_names[obj.name]['pk']))
                return True
            except RuntimeError:
                return False  # in the edge case (e.g. parent/child) that an object cannot be merged don't update it for now
        else:
            return True

    @staticmethod
    def _get_existing_obj(obj, existing_data_slugs, existing_data_names):
        """
        gets the existing object from slug or name cache
        :param obj: object that should be found
        :type obj: Model
        :param existing_data_slugs: dict of open data slugs mapped to objects
        :type existing_data_slugs: dict
        :param existing_data_names: dict of names mapped to objects
        :type existing_data_names: dict
        :return: existing object
        :rtype: dict
        """
        existing_obj = None
        if obj.open_data_slug in existing_data_slugs:
            existing_obj = existing_data_slugs[obj.open_data_slug]
        elif obj.name in existing_data_names:
            existing_obj = existing_data_names[obj.name]

        return existing_obj

    def import_units(self):
        datatype = 'unit'
        model_type = Unit
        field_list = ['name', 'plural_name', 'base_unit', 'open_data_slug']

        existing_data_slugs = {}
        existing_data_names = {}
        for obj in model_type.objects.filter(space=self.request.space).values('pk', *field_list):
            existing_data_slugs[obj['open_data_slug']] = obj
            existing_data_names[obj['name']] = obj

        update_list = []
        create_list = []

        for u in list(self.data[datatype].keys()):
            obj = model_type(
                name=self.data[datatype][u]['name'],
                plural_name=self.data[datatype][u]['plural_name'],
                base_unit=self.data[datatype][u]['base_unit'].lower() if self.data[datatype][u]['base_unit'] != '' else None,
                open_data_slug=u,
                space=self.request.space
            )
            if obj.open_data_slug in existing_data_slugs or obj.name in existing_data_names:
                if not self._merge_if_conflicting(model_type, obj, existing_data_slugs, existing_data_names):
                    continue  # if conflicting objects exist and cannot be merged skip object

                existing_obj = self._get_existing_obj(obj, existing_data_slugs, existing_data_names)

                if not self._is_obj_identical(field_list, obj, existing_obj):
                    obj.pk = existing_obj['pk']
                    update_list.append(obj)
            else:
                create_list.append(obj)

        total_count = 0
        if self.update_existing and len(update_list) > 0:
            model_type.objects.bulk_update(update_list, field_list)
            total_count += len(update_list)

        if len(create_list) > 0:
            model_type.objects.bulk_create(create_list, update_conflicts=True, update_fields=field_list, unique_fields=('space', 'name',))
            total_count += len(create_list)

        return total_count

    def import_category(self):
        datatype = 'category'
        model_type = SupermarketCategory
        field_list = ['name', 'open_data_slug']

        existing_data_slugs = {}
        existing_data_names = {}
        for obj in model_type.objects.filter(space=self.request.space).values('pk', *field_list):
            existing_data_slugs[obj['open_data_slug']] = obj
            existing_data_names[obj['name']] = obj

        update_list = []
        create_list = []

        for k in list(self.data[datatype].keys()):
            obj = model_type(
                name=self.data[datatype][k]['name'],
                open_data_slug=k,
                space=self.request.space
            )

            if obj.open_data_slug in existing_data_slugs or obj.name in existing_data_names:
                if not self._merge_if_conflicting(model_type, obj, existing_data_slugs, existing_data_names):
                    continue  # if conflicting objects exist and cannot be merged skip object

                existing_obj = self._get_existing_obj(obj, existing_data_slugs, existing_data_names)

                if not self._is_obj_identical(field_list, obj, existing_obj):
                    obj.pk = existing_obj['pk']
                    update_list.append(obj)
            else:
                create_list.append(obj)

        total_count = 0
        if self.update_existing and len(update_list) > 0:
            model_type.objects.bulk_update(update_list, field_list)
            total_count += len(update_list)

        if len(create_list) > 0:
            model_type.objects.bulk_create(create_list, update_conflicts=True, update_fields=field_list, unique_fields=('space', 'name',))
            total_count += len(create_list)

        return total_count

    def import_property(self):
        datatype = 'property'

        existing_data = {}
        for obj in PropertyType.objects.filter(space=self.request.space, open_data_slug__isnull=False).values('pk', 'name', 'open_data_slug'):
            existing_data[obj['open_data_slug']] = obj

        update_list = []
        create_list = []

        for k in list(self.data[datatype].keys()):
            obj = PropertyType(
                name=self.data[datatype][k]['name'],
                unit=self.data[datatype][k]['unit'],
                fdc_id=self.data[datatype][k]['fdc_id'],
                open_data_slug=k,
                space=self.request.space
            )
            if obj.open_data_slug in existing_data:
                obj.pk = existing_data[obj.open_data_slug]['pk']
                update_list.append(obj)
            else:
                create_list.append(obj)

        total_count = 0
        if self.update_existing and len(update_list) > 0:
            PropertyType.objects.bulk_update(update_list, ('name', 'fdc_id', 'unit', 'open_data_slug'))
            total_count += len(update_list)

        if len(create_list) > 0:
            PropertyType.objects.bulk_create(create_list, update_conflicts=True, update_fields=('open_data_slug',), unique_fields=('space', 'name',))
            total_count += len(create_list)

        return total_count

    def import_supermarket(self):
        datatype = 'store'

        existing_data = {}
        for obj in Supermarket.objects.filter(space=self.request.space, open_data_slug__isnull=False).values('pk', 'name', 'open_data_slug'):
            existing_data[obj['open_data_slug']] = obj

        update_list = []
        create_list = []

        self._update_slug_cache(SupermarketCategory, 'category')
        for k in list(self.data[datatype].keys()):
            obj = Supermarket(
                name=self.data[datatype][k]['name'],
                open_data_slug=k,
                space=self.request.space
            )
            if obj.open_data_slug in existing_data:
                obj.pk = existing_data[obj.open_data_slug]['pk']
                update_list.append(obj)
            else:
                create_list.append(obj)

        total_count = 0
        if self.update_existing and len(update_list) > 0:
            Supermarket.objects.bulk_update(update_list, ('name', 'open_data_slug'))
            total_count += len(update_list)

        if len(create_list) > 0:
            Supermarket.objects.bulk_create(create_list, unique_fields=('space', 'name',), update_conflicts=True, update_fields=('open_data_slug',))
            total_count += len(create_list)

        # always add open data slug if matching supermarket is found, otherwise relation might fail
        self._update_slug_cache(Supermarket, 'store')

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

        return total_count

    def import_food(self):
        datatype = 'food'

        self._update_slug_cache(Unit, 'unit')
        self._update_slug_cache(PropertyType, 'property')
        self._update_slug_cache(SupermarketCategory, 'category')

        unit_g = Unit.objects.filter(space=self.request.space, base_unit__iexact='g').first()

        existing_data = {}
        existing_data_names = {}
        for obj in Food.objects.filter(space=self.request.space).values('pk', 'name', 'open_data_slug'):
            if 'open_data_slug' in obj:
                existing_data[obj['open_data_slug']] = obj
            existing_data_names[obj['name']] = obj

        update_list = []
        create_list = []

        for k in list(self.data[datatype].keys()):

            obj = {
                'name': self.data[datatype][k]['name'],
                'plural_name': self.data[datatype][k]['plural_name'] if self.data[datatype][k]['plural_name'] != '' else None,
                'supermarket_category_id': self.slug_id_cache['category'][self.data[datatype][k]['store_category']],
                'fdc_id': re.sub(r'\D', '', self.data[datatype][k]['fdc_id']) if self.data[datatype][k]['fdc_id'] != '' else None,
                'open_data_slug': k,
                'properties_food_unit_id': None,
                'space': self.request.space.id,
            }

            if unit_g:
                obj['properties_food_unit_id'] = unit_g.id

            if obj['open_data_slug'] in existing_data or obj['name'] in existing_data_names:
                # rather rare edge cases object A has the slug and object B has the name which would lead to uniqueness errors
                if obj['open_data_slug'] in existing_data and obj['name'] in existing_data_names and existing_data[obj['open_data_slug']]['pk'] != existing_data_names[obj['name']]['pk']:
                    # TODO this fails if objects are parent/children of a tree
                    # TODO this does not merge nicely (with data), write better merge method (or use generalized one if available when reading this)
                    source_obj = Food.objects.get(pk=existing_data[obj['open_data_slug']]['pk'])
                    del existing_data[obj['open_data_slug']]
                    source_obj.merge_into(Food.objects.get(pk=existing_data_names[obj['name']]['pk']))

                if obj['open_data_slug'] in existing_data:
                    obj['pk'] = existing_data[obj['open_data_slug']]['pk']
                elif obj['name'] in existing_data_names:
                    obj['pk'] = existing_data_names[obj['name']]['pk']

                obj['space'] = self.request.space
                obj = Food(**obj)
                update_list.append(obj)
            else:
                create_list.append({'data': obj})

        total_count = 0
        if self.update_existing and len(update_list) > 0:
            Food.objects.bulk_update(update_list, ['name', 'plural_name', 'properties_food_unit_id', 'supermarket_category_id', 'fdc_id', 'open_data_slug', ])
            total_count += len(update_list)

        if len(create_list) > 0:
            Food.load_bulk(create_list, None)
            total_count += len(create_list)

        self._update_slug_cache(Food, 'food')
        valid_food_ids = []
        for f in self.slug_id_cache['food'].values():
            valid_food_ids.append(f)

        food_property_list = []
        # alias_list = []

        for k in list(self.data[datatype].keys()):
            for fp in self.data[datatype][k]['properties']['type_values']:
                # try catch here because sometimes key "k" is not set for the food cache
                try:
                    if self.slug_id_cache['food'][k] == 2652:
                        pass
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
            # temporary fix to delete old, unlinked properties that were previously imported
            # TODO find better solution (clearing import_food_id, not doing that in the first place?
            if p[0] not in valid_food_ids:
                Property.objects.filter(import_food_id=p[0]).delete()
            else:
                property_food_relation_list.append(Food.properties.through(food_id=p[0], property_id=p[1]))

        FoodProperty.objects.bulk_create(property_food_relation_list, ignore_conflicts=True, unique_fields=('food_id', 'property_id',))

        return total_count

    def import_conversion(self):
        datatype = 'conversion'

        self._update_slug_cache(Food, 'food')
        self._update_slug_cache(Unit, 'unit')

        existing_data = {}
        for obj in UnitConversion.objects.filter(space=self.request.space, open_data_slug__isnull=False).values('pk', 'open_data_slug'):
            existing_data[obj['open_data_slug']] = obj

        update_list = []
        create_list = []

        for k in list(self.data[datatype].keys()):
            # try catch here because sometimes key "k" is not set for he food cache
            try:
                obj = UnitConversion(
                    base_amount=self.data[datatype][k]['base_amount'],
                    base_unit_id=self.slug_id_cache['unit'][self.data[datatype][k]['base_unit']],
                    converted_amount=self.data[datatype][k]['converted_amount'],
                    converted_unit_id=self.slug_id_cache['unit'][self.data[datatype][k]['converted_unit']],
                    food_id=self.slug_id_cache['food'][self.data[datatype][k]['food']],
                    open_data_slug=k,
                    space=self.request.space,
                    created_by=self.request.user,
                )

                if obj.open_data_slug in existing_data:
                    obj.pk = existing_data[obj.open_data_slug]['pk']
                    update_list.append(obj)
                else:
                    create_list.append(obj)
            except KeyError:
                print(str(k) + ' is not in self.slug_id_cache["food"]')

        total_count = 0
        if self.update_existing and len(update_list) > 0:
            UnitConversion.objects.bulk_update(update_list, ('base_unit', 'base_amount', 'converted_unit', 'converted_amount', 'food',))
            total_count += len(update_list)

        if len(create_list) > 0:
            UnitConversion.objects.bulk_create(create_list, ignore_conflicts=True, unique_fields=('space', 'base_unit', 'converted_unit', 'food', 'open_data_slug'))
            total_count += len(create_list)

        return total_count
