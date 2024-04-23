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
 * * `DB` - Dropbox
 * * `NEXTCLOUD` - Nextcloud
 * * `LOCAL` - Local
 * @export
 */
export const MethodEnum = {
    Db: 'DB',
    Nextcloud: 'NEXTCLOUD',
    Local: 'LOCAL'
} as const;
export type MethodEnum = typeof MethodEnum[keyof typeof MethodEnum];


export function instanceOfMethodEnum(value: any): boolean {
    return Object.values(MethodEnum).includes(value);
}

export function MethodEnumFromJSON(json: any): MethodEnum {
    return MethodEnumFromJSONTyped(json, false);
}

export function MethodEnumFromJSONTyped(json: any, ignoreDiscriminator: boolean): MethodEnum {
    return json as MethodEnum;
}

export function MethodEnumToJSON(value?: MethodEnum | null): any {
    return value as any;
}
