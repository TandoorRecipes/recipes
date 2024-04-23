/* tslint:disable */
/* eslint-disable */
/**
 * Tandoor
 * Tandoor API Docs
 *
 * The version of the OpenAPI document: 0.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * Moves `UniqueValidator`'s from the validation stage to the save stage.
 * It solves the problem with nested validation for unique fields on update.
 * 
 * If you want more details, you can read related issues and articles:
 * https://github.com/beda-software/drf-writable-nested/issues/1
 * http://www.django-rest-framework.org/api-guide/validators/#updating-nested-serializers
 * 
 * Example of usage:
 * ```
 *     class Child(models.Model):
 *     field = models.CharField(unique=True)
 * 
 * 
 * class Parent(models.Model):
 *     child = models.ForeignKey('Child')
 * 
 * 
 * class ChildSerializer(UniqueFieldsMixin, serializers.ModelSerializer):
 *     class Meta:
 *         model = Child
 * 
 * 
 * class ParentSerializer(NestedUpdateMixin, serializers.ModelSerializer):
 *     child = ChildSerializer()
 * 
 *     class Meta:
 *         model = Parent
 * ```
 * 
 * Note: `UniqueFieldsMixin` must be applied only on the serializer
 * which has unique fields.
 * 
 * Note: When you are using both mixins
 * (`UniqueFieldsMixin` and `NestedCreateMixin` or `NestedUpdateMixin`)
 * you should put `UniqueFieldsMixin` ahead.
 * @export
 * @interface PatchedUnit
 */
export interface PatchedUnit {
    /**
     * 
     * @type {number}
     * @memberof PatchedUnit
     */
    readonly id?: number;
    /**
     * 
     * @type {string}
     * @memberof PatchedUnit
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedUnit
     */
    pluralName?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedUnit
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedUnit
     */
    baseUnit?: string;
    /**
     * 
     * @type {string}
     * @memberof PatchedUnit
     */
    openDataSlug?: string;
}

/**
 * Check if a given object implements the PatchedUnit interface.
 */
export function instanceOfPatchedUnit(value: object): boolean {
    return true;
}

export function PatchedUnitFromJSON(json: any): PatchedUnit {
    return PatchedUnitFromJSONTyped(json, false);
}

export function PatchedUnitFromJSONTyped(json: any, ignoreDiscriminator: boolean): PatchedUnit {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'name': json['name'] == null ? undefined : json['name'],
        'pluralName': json['plural_name'] == null ? undefined : json['plural_name'],
        'description': json['description'] == null ? undefined : json['description'],
        'baseUnit': json['base_unit'] == null ? undefined : json['base_unit'],
        'openDataSlug': json['open_data_slug'] == null ? undefined : json['open_data_slug'],
    };
}

export function PatchedUnitToJSON(value?: Omit<PatchedUnit, 'id'> | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'name': value['name'],
        'plural_name': value['pluralName'],
        'description': value['description'],
        'base_unit': value['baseUnit'],
        'open_data_slug': value['openDataSlug'],
    };
}
