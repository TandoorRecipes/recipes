import traceback
from collections import defaultdict
from decimal import Decimal

from cookbook.models import (Food, FoodProperty, Property, PropertyType, Supermarket,
                             SupermarketCategory, SupermarketCategoryRelation, Unit, UnitConversion)
import re


class OpenDataImportResponse:
    total_created = 0
    total_updated = 0
    total_untouched = 0
    total_errored = 0

    def to_dict(self):
        return {'total_created': self.total_created, 'total_updated': self.total_updated, 'total_untouched': self.total_untouched, 'total_errored': self.total_errored}


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
            if isinstance(getattr(obj, field), float) or isinstance(getattr(obj, field), Decimal):
                if abs(float(getattr(obj, field)) - float(existing_obj[field])) > 0.001:  # convert both to float and check if basically equal
                    print(f'comparing FLOAT {obj} failed because field {field} is not equal ({getattr(obj, field)} != {existing_obj[field]})')
                    return False
            elif getattr(obj, field) != existing_obj[field]:
                print(f'comparing {obj} failed because field {field} is not equal ({getattr(obj, field)} != {existing_obj[field]})')
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
        od_response = OpenDataImportResponse()
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
                    od_response.total_errored += 1
                    continue  # if conflicting objects exist and cannot be merged skip object

                existing_obj = self._get_existing_obj(obj, existing_data_slugs, existing_data_names)

                if not self._is_obj_identical(field_list, obj, existing_obj):
                    obj.pk = existing_obj['pk']
                    update_list.append(obj)
                else:
                    od_response.total_untouched += 1
            else:
                create_list.append(obj)

        if self.update_existing and len(update_list) > 0:
            model_type.objects.bulk_update(update_list, field_list)
            od_response.total_updated += len(update_list)

        if len(create_list) > 0:
            model_type.objects.bulk_create(create_list, update_conflicts=True, update_fields=field_list, unique_fields=('space', 'name',))
            od_response.total_created += len(create_list)

        return od_response

    def import_category(self):
        od_response = OpenDataImportResponse()
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
                    od_response.total_errored += 1
                    continue  # if conflicting objects exist and cannot be merged skip object

                existing_obj = self._get_existing_obj(obj, existing_data_slugs, existing_data_names)

                if not self._is_obj_identical(field_list, obj, existing_obj):
                    obj.pk = existing_obj['pk']
                    update_list.append(obj)
                else:
                    od_response.total_untouched += 1
            else:
                create_list.append(obj)

        if self.update_existing and len(update_list) > 0:
            model_type.objects.bulk_update(update_list, field_list)
            od_response.total_updated += len(update_list)

        if len(create_list) > 0:
            model_type.objects.bulk_create(create_list, update_conflicts=True, update_fields=field_list, unique_fields=('space', 'name',))
            od_response.total_created += len(create_list)

        return od_response

    def import_property(self):
        od_response = OpenDataImportResponse()
        datatype = 'property'
        model_type = PropertyType
        field_list = ['name', 'unit', 'fdc_id', 'open_data_slug']

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
                unit=self.data[datatype][k]['unit'],
                fdc_id=self.data[datatype][k]['fdc_id'],
                open_data_slug=k,
                space=self.request.space
            )

            if obj.open_data_slug in existing_data_slugs or obj.name in existing_data_names:
                if not self._merge_if_conflicting(model_type, obj, existing_data_slugs, existing_data_names):
                    od_response.total_errored += 1
                    continue  # if conflicting objects exist and cannot be merged skip object

                existing_obj = self._get_existing_obj(obj, existing_data_slugs, existing_data_names)

                if not self._is_obj_identical(field_list, obj, existing_obj):
                    obj.pk = existing_obj['pk']
                    update_list.append(obj)
                else:
                    od_response.total_untouched += 1
            else:
                create_list.append(obj)

        if self.update_existing and len(update_list) > 0:
            model_type.objects.bulk_update(update_list, field_list)
            od_response.total_updated += len(update_list)

        if len(create_list) > 0:
            model_type.objects.bulk_create(create_list, update_conflicts=True, update_fields=field_list, unique_fields=('space', 'name',))
            od_response.total_created += len(create_list)

        return od_response

    def import_supermarket(self):
        od_response = OpenDataImportResponse()
        datatype = 'store'
        model_type = Supermarket
        field_list = ['name', 'open_data_slug']

        existing_data_slugs = {}
        existing_data_names = {}
        for obj in model_type.objects.filter(space=self.request.space).values('pk', *field_list):
            existing_data_slugs[obj['open_data_slug']] = obj
            existing_data_names[obj['name']] = obj

        update_list = []
        create_list = []

        self._update_slug_cache(SupermarketCategory, 'category')
        for k in list(self.data[datatype].keys()):
            obj = model_type(
                name=self.data[datatype][k]['name'],
                open_data_slug=k,
                space=self.request.space
            )
            if obj.open_data_slug in existing_data_slugs or obj.name in existing_data_names:
                if not self._merge_if_conflicting(model_type, obj, existing_data_slugs, existing_data_names):
                    od_response.total_errored += 1
                    continue  # if conflicting objects exist and cannot be merged skip object

                existing_obj = self._get_existing_obj(obj, existing_data_slugs, existing_data_names)

                if not self._is_obj_identical(field_list, obj, existing_obj):
                    obj.pk = existing_obj['pk']
                    update_list.append(obj)
                else:
                    od_response.total_untouched += 1
            else:
                create_list.append(obj)

        if self.update_existing and len(update_list) > 0:
            model_type.objects.bulk_update(update_list, field_list)
            od_response.total_updated += len(update_list)

        if len(create_list) > 0:
            model_type.objects.bulk_create(create_list, update_conflicts=True, update_fields=field_list, unique_fields=('space', 'name',))
            od_response.total_created += len(create_list)

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

        return od_response

    def import_food(self):
        od_response = OpenDataImportResponse()
        datatype = 'food'
        model_type = Food
        field_list = ['name', 'open_data_slug']

        existing_data_slugs = {}
        existing_data_names = {}
        for obj in model_type.objects.filter(space=self.request.space).values('pk', *field_list):
            existing_data_slugs[obj['open_data_slug']] = obj
            existing_data_names[obj['name']] = obj

        update_list = []
        create_list = []

        self._update_slug_cache(Unit, 'unit')
        self._update_slug_cache(PropertyType, 'property')
        self._update_slug_cache(SupermarketCategory, 'category')

        unit_g = Unit.objects.filter(space=self.request.space, base_unit__iexact='g').first()

        for k in list(self.data[datatype].keys()):

            obj_dict = {
                'name': self.data[datatype][k]['name'],
                'plural_name': self.data[datatype][k]['plural_name'] if self.data[datatype][k]['plural_name'] != '' else None,
                'supermarket_category_id': self.slug_id_cache['category'][self.data[datatype][k]['store_category']],
                'fdc_id': re.sub(r'\D', '', self.data[datatype][k]['fdc_id']) if self.data[datatype][k]['fdc_id'] != '' else None,
                'open_data_slug': k,
                'properties_food_unit_id': None,
                'space_id': self.request.space.id,
            }

            if unit_g:
                obj_dict['properties_food_unit_id'] = unit_g.id

            obj = model_type(**obj_dict)

            if obj.open_data_slug in existing_data_slugs or obj.name in existing_data_names:
                if not self._merge_if_conflicting(model_type, obj, existing_data_slugs, existing_data_names):
                    od_response.total_errored += 1
                    continue  # if conflicting objects exist and cannot be merged skip object

                existing_obj = self._get_existing_obj(obj, existing_data_slugs, existing_data_names)

                if not self._is_obj_identical(field_list, obj, existing_obj):
                    obj.pk = existing_obj['pk']
                    update_list.append(obj)
                else:
                    od_response.total_untouched += 1
            else:
                create_list.append({'data': obj_dict})

        if self.update_existing and len(update_list) > 0:
            model_type.objects.bulk_update(update_list, field_list)
            od_response.total_updated += len(update_list)

        if len(create_list) > 0:
            Food.load_bulk(create_list, None)
            od_response.total_created += len(create_list)

        # --------------- PROPERTY STUFF -----------------------
        model_type = Property
        field_list = ['property_type_id', 'property_amount', 'open_data_food_slug']

        existing_data_slugs = {}
        existing_data_property_types = {}
        for obj in model_type.objects.filter(space=self.request.space).values('pk', *field_list):
            existing_data_slugs[obj['open_data_food_slug']] = obj
            existing_data_property_types[obj['property_type_id']] = obj

        update_list = []
        create_list = []

        self._update_slug_cache(Food, 'food')

        for k in list(self.data['food'].keys()):
            for fp in self.data['food'][k]['properties']['type_values']:
                obj = model_type(
                    property_type_id=self.slug_id_cache['property'][fp['property_type']],
                    property_amount=fp['property_value'],
                    open_data_food_slug=k,
                    space=self.request.space,
                )

                if obj.open_data_food_slug in existing_data_slugs and obj.property_type_id in existing_data_property_types and existing_data_slugs[obj.open_data_food_slug] == existing_data_property_types[obj.property_type_id]:
                    existing_obj = existing_data_slugs[obj.open_data_food_slug]

                    if not self._is_obj_identical(field_list, obj, existing_obj):
                        obj.pk = existing_obj['pk']
                        update_list.append(obj)
                else:
                    create_list.append(obj)

        if self.update_existing and len(update_list) > 0:
            model_type.objects.bulk_update(update_list, field_list)

        if len(create_list) > 0:
            model_type.objects.bulk_create(create_list, ignore_conflicts=True, unique_fields=('space', 'open_data_food_slug', 'property_type',))

        linked_properties = list(FoodProperty.objects.filter(food__space=self.request.space).values_list('property_id', flat=True).all())

        property_food_relation_list = []
        for p in model_type.objects.filter(space=self.request.space, open_data_food_slug__isnull=False).values_list('open_data_food_slug', 'id', ):
            if p[1] == 147:
                pass
            # slug_id_cache should always exist, don't create relations for already linked properties (ignore_conflicts would do that as well but this is more performant)
            if p[0] in self.slug_id_cache['food'] and p[1] not in linked_properties:
                property_food_relation_list.append(Food.properties.through(food_id=self.slug_id_cache['food'][p[0]], property_id=p[1]))

        FoodProperty.objects.bulk_create(property_food_relation_list, unique_fields=('food_id', 'property_id',))

        return od_response

    def import_conversion(self):
        od_response = OpenDataImportResponse()
        datatype = 'conversion'
        model_type = UnitConversion
        field_list = ['base_amount', 'base_unit_id', 'converted_amount', 'converted_unit_id', 'food_id', 'open_data_slug']

        self._update_slug_cache(Food, 'food')
        self._update_slug_cache(Unit, 'unit')

        existing_data_slugs = {}
        existing_data_foods = defaultdict(list)
        for obj in model_type.objects.filter(space=self.request.space).values('pk', *field_list):
            existing_data_slugs[obj['open_data_slug']] = obj
            existing_data_foods[obj['food_id']].append(obj)

        update_list = []
        create_list = []

        for k in list(self.data[datatype].keys()):
            # try catch here because sometimes key "k" is not set for the food cache
            try:
                obj = model_type(
                    base_amount=Decimal(self.data[datatype][k]['base_amount']),
                    base_unit_id=self.slug_id_cache['unit'][self.data[datatype][k]['base_unit']],
                    converted_amount=Decimal(self.data[datatype][k]['converted_amount']),
                    converted_unit_id=self.slug_id_cache['unit'][self.data[datatype][k]['converted_unit']],
                    food_id=self.slug_id_cache['food'][self.data[datatype][k]['food']],
                    open_data_slug=k,
                    space=self.request.space,
                    created_by_id=self.request.user.id,
                )

                if obj.open_data_slug in existing_data_slugs:
                    existing_obj = existing_data_slugs[obj.open_data_slug]
                    if not self._is_obj_identical(field_list, obj, existing_obj):
                        obj.pk = existing_obj['pk']
                        update_list.append(obj)
                    else:
                        od_response.total_untouched += 1
                else:
                    matching_existing_found = False
                    if obj.food_id in existing_data_foods:
                        for edf in existing_data_foods[obj.food_id]:
                            if obj.base_unit_id == edf['base_unit_id'] and obj.converted_unit_id == edf['converted_unit_id']:
                                matching_existing_found = True
                                if not self._is_obj_identical(field_list, obj, edf):
                                    obj.pk = edf['pk']
                                    update_list.append(obj)
                                else:
                                    od_response.total_untouched += 1
                    if not matching_existing_found:
                        create_list.append(obj)
            except KeyError as e:
                traceback.print_exc()
                od_response.total_errored += 1
                print(self.data[datatype][k]['food'] + ' is not in self.slug_id_cache["food"]')

        if self.update_existing and len(update_list) > 0:
            od_response.total_updated = model_type.objects.bulk_update(update_list, field_list)
            od_response.total_errored += len(update_list) - od_response.total_updated

        if len(create_list) > 0:
            objs_created = model_type.objects.bulk_create(create_list, ignore_conflicts=True, unique_fields=('space', 'base_unit', 'converted_unit', 'food', 'open_data_slug'))
            od_response.total_created = len(objs_created)
            od_response.total_errored += len(create_list) - od_response.total_created

        return od_response
