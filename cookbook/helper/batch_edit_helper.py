def add_to_relation(relation_model, base_field_name, base_ids, related_field_name, related_ids):
    """
    given a model, the base and related field and the base and related ids, bulk create relation objects
    """
    relation_objects = []
    for b in base_ids:
        for r in related_ids:
            relation_objects.append(relation_model(**{base_field_name: b, related_field_name: r}))
    relation_model.objects.bulk_create(relation_objects, ignore_conflicts=True, unique_fields=(base_field_name, related_field_name,))


def remove_from_relation(relation_model, base_field_name, base_ids, related_field_name, related_ids):
    relation_model.objects.filter(**{f'{base_field_name}__in': base_ids, f'{related_field_name}__in': related_ids}).delete()


def remove_all_from_relation(relation_model, base_field_name, base_ids):
    relation_model.objects.filter(**{f'{base_field_name}__in': base_ids}).delete()


def set_relation(relation_model, base_field_name, base_ids, related_field_name, related_ids):
    remove_all_from_relation(relation_model, base_field_name, base_ids)
    add_to_relation(relation_model, base_field_name, base_ids, related_field_name, related_ids)
