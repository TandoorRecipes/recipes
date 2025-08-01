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
import type { Unit } from './Unit';
import {
    UnitFromJSON,
    UnitFromJSONTyped,
    UnitToJSON,
} from './Unit';
import type { Food } from './Food';
import {
    FoodFromJSON,
    FoodFromJSONTyped,
    FoodToJSON,
} from './Food';

/**
 * Adds nested create feature
 * @export
 * @interface PatchedUnitConversion
 */
export interface PatchedUnitConversion {
    /**
     * 
     * @type {number}
     * @memberof PatchedUnitConversion
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof PatchedUnitConversion
     */
    readonly name?: string;
    /**
     * 
     * @type {number}
     * @memberof PatchedUnitConversion
     */
    baseAmount?: number;
    /**
     * 
     * @type {Unit}
     * @memberof PatchedUnitConversion
     */
    baseUnit?: Unit;
    /**
     * 
     * @type {number}
     * @memberof PatchedUnitConversion
     */
    convertedAmount?: number;
    /**
     * 
     * @type {Unit}
     * @memberof PatchedUnitConversion
     */
    convertedUnit?: Unit;
    /**
     * 
     * @type {Food}
     * @memberof PatchedUnitConversion
     */
    food?: Food;
    /**
     * 
     * @type {string}
     * @memberof PatchedUnitConversion
     */
    openDataSlug?: string;
}

/**
 * Check if a given object implements the PatchedUnitConversion interface.
 */
export function instanceOfPatchedUnitConversion(value: object): value is PatchedUnitConversion {
    return true;
}

export function PatchedUnitConversionFromJSON(json: any): PatchedUnitConversion {
    return PatchedUnitConversionFromJSONTyped(json, false);
}

export function PatchedUnitConversionFromJSONTyped(json: any, ignoreDiscriminator: boolean): PatchedUnitConversion {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'name': json['name'] == null ? undefined : json['name'],
        'baseAmount': json['base_amount'] == null ? undefined : json['base_amount'],
        'baseUnit': json['base_unit'] == null ? undefined : UnitFromJSON(json['base_unit']),
        'convertedAmount': json['converted_amount'] == null ? undefined : json['converted_amount'],
        'convertedUnit': json['converted_unit'] == null ? undefined : UnitFromJSON(json['converted_unit']),
        'food': json['food'] == null ? undefined : FoodFromJSON(json['food']),
        'openDataSlug': json['open_data_slug'] == null ? undefined : json['open_data_slug'],
    };
}

export function PatchedUnitConversionToJSON(value?: Omit<PatchedUnitConversion, 'name'> | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'base_amount': value['baseAmount'],
        'base_unit': UnitToJSON(value['baseUnit']),
        'converted_amount': value['convertedAmount'],
        'converted_unit': UnitToJSON(value['convertedUnit']),
        'food': FoodToJSON(value['food']),
        'open_data_slug': value['openDataSlug'],
    };
}

