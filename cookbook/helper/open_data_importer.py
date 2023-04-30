from django.db.models import Q

from cookbook.models import Unit, SupermarketCategory, FoodProperty, FoodPropertyType, Supermarket, SupermarketCategoryRelation


def import_units(data, request):
    unit_name_list = []
    for u in list(data['unit'].keys()):
        unit_name_list.append(data['unit'][u]['name'])
        unit_name_list.append(data['unit'][u]['plural_name'])

    existing_units = Unit.objects.filter(space=request.space).filter(Q(name__in=unit_name_list) | Q(plural_name__in=unit_name_list)).values_list('name', 'plural_name')
    existing_units = [item for sublist in existing_units for item in sublist]

    insert_list = []
    for u in list(data['unit'].keys()):
        if not (data['unit'][u]['name'] in existing_units or data['unit'][u]['plural_name'] in existing_units):
            insert_list.append(Unit(
                name=data['unit'][u]['name'],
                plural_name=data['unit'][u]['plural_name'],
                base_unit=data['unit'][u]['base_unit'] if data['unit'][u]['base_unit'] != '' else None,
                open_data_slug=u,
                space=request.space
            ))

    Unit.objects.bulk_create(insert_list)
    return len(insert_list)


def import_category(data, request):
    identifier_list = []
    datatype = 'category'
    for k in list(data[datatype].keys()):
        identifier_list.append(data[datatype][k]['name'])

    existing_objects = SupermarketCategory.objects.filter(space=request.space).filter(name__in=identifier_list).values_list('name', flat=True)

    insert_list = []
    for k in list(data[datatype].keys()):
        if not (data[datatype][k]['name'] in existing_objects):
            insert_list.append(SupermarketCategory(
                name=data[datatype][k]['name'],
                open_data_slug=k,
                space=request.space
            ))

    SupermarketCategory.objects.bulk_create(insert_list)
    return len(insert_list)


def import_property(data, request):
    identifier_list = []
    datatype = 'property'
    for k in list(data[datatype].keys()):
        identifier_list.append(data[datatype][k]['name'])

    existing_objects = FoodPropertyType.objects.filter(space=request.space).filter(name__in=identifier_list).values_list('name', flat=True)

    insert_list = []
    for k in list(data[datatype].keys()):
        if not (data[datatype][k]['name'] in existing_objects):
            insert_list.append(FoodPropertyType(
                name=data[datatype][k]['name'],
                unit=data[datatype][k]['unit'],
                open_data_slug=k,
                space=request.space
            ))

    FoodPropertyType.objects.bulk_create(insert_list)
    return len(insert_list)


def import_supermarket(data, request):
    identifier_list = []
    datatype = 'supermarket'
    for k in list(data[datatype].keys()):
        identifier_list.append(data[datatype][k]['name'])

    existing_objects = Supermarket.objects.filter(space=request.space).filter(name__in=identifier_list).values_list('name', flat=True)

    supermarket_categories = SupermarketCategory.objects.filter(space=request.space, open_data_slug__isnull=False).values_list('id', 'open_data_slug')
    insert_list = []
    for k in list(data[datatype].keys()):
        if not (data[datatype][k]['name'] in existing_objects): # TODO on large datasets see if bulk creating supermarkets and then relations as well is better
            supermarket = Supermarket.objects.create(
                name=data[datatype][k]['name'],
                open_data_slug=k,
                space=request.space
            )

            relations = []
            order = 0
            for c in data[datatype][k]['categories']:
                relations.append(
                    SupermarketCategoryRelation(
                        supermarket=supermarket,
                        category_id=[x[0] for x in supermarket_categories if x[1] == c][0],
                        order=order,
                    )
                )
                order += 1

            SupermarketCategoryRelation.objects.bulk_create(relations)

    return len(insert_list)
