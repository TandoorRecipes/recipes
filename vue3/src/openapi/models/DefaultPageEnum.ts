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


/**
 * * `SEARCH` - Search
 * * `PLAN` - Meal-Plan
 * * `BOOKS` - Books
 * * `SHOPPING` - Shopping
 * @export
 */
export const DefaultPageEnum = {
    Search: 'SEARCH',
    Plan: 'PLAN',
    Books: 'BOOKS',
    Shopping: 'SHOPPING'
} as const;
export type DefaultPageEnum = typeof DefaultPageEnum[keyof typeof DefaultPageEnum];


export function instanceOfDefaultPageEnum(value: any): boolean {
    for (const key in DefaultPageEnum) {
        if (Object.prototype.hasOwnProperty.call(DefaultPageEnum, key)) {
            if (DefaultPageEnum[key] === value) {
                return true;
            }
        }
    }
    return false;
}

export function DefaultPageEnumFromJSON(json: any): DefaultPageEnum {
    return DefaultPageEnumFromJSONTyped(json, false);
}

export function DefaultPageEnumFromJSONTyped(json: any, ignoreDiscriminator: boolean): DefaultPageEnum {
    return json as DefaultPageEnum;
}

export function DefaultPageEnumToJSON(value?: DefaultPageEnum | null): any {
    return value as any;
}

