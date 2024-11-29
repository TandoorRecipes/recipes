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
import type { OpenDataVersionRequest } from './OpenDataVersionRequest';
import {
    OpenDataVersionRequestFromJSON,
    OpenDataVersionRequestFromJSONTyped,
    OpenDataVersionRequestToJSON,
} from './OpenDataVersionRequest';

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
 * @interface OpenDataPropertyRequest
 */
export interface OpenDataPropertyRequest {
    /**
     * 
     * @type {OpenDataVersionRequest}
     * @memberof OpenDataPropertyRequest
     */
    version: OpenDataVersionRequest;
    /**
     * 
     * @type {string}
     * @memberof OpenDataPropertyRequest
     */
    slug: string;
    /**
     * 
     * @type {string}
     * @memberof OpenDataPropertyRequest
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof OpenDataPropertyRequest
     */
    unit?: string;
    /**
     * 
     * @type {number}
     * @memberof OpenDataPropertyRequest
     */
    fdcId?: number;
    /**
     * 
     * @type {string}
     * @memberof OpenDataPropertyRequest
     */
    comment?: string;
    /**
     * 
     * @type {number}
     * @memberof OpenDataPropertyRequest
     */
    id?: number;
}

/**
 * Check if a given object implements the OpenDataPropertyRequest interface.
 */
export function instanceOfOpenDataPropertyRequest(value: object): boolean {
    if (!('version' in value)) return false;
    if (!('slug' in value)) return false;
    if (!('name' in value)) return false;
    return true;
}

export function OpenDataPropertyRequestFromJSON(json: any): OpenDataPropertyRequest {
    return OpenDataPropertyRequestFromJSONTyped(json, false);
}

export function OpenDataPropertyRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): OpenDataPropertyRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'version': OpenDataVersionRequestFromJSON(json['version']),
        'slug': json['slug'],
        'name': json['name'],
        'unit': json['unit'] == null ? undefined : json['unit'],
        'fdcId': json['fdc_id'] == null ? undefined : json['fdc_id'],
        'comment': json['comment'] == null ? undefined : json['comment'],
        'id': json['id'] == null ? undefined : json['id'],
    };
}

export function OpenDataPropertyRequestToJSON(value?: OpenDataPropertyRequest | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'version': OpenDataVersionRequestToJSON(value['version']),
        'slug': value['slug'],
        'name': value['name'],
        'unit': value['unit'],
        'fdc_id': value['fdcId'],
        'comment': value['comment'],
        'id': value['id'],
    };
}
