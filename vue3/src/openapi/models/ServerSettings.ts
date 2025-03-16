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
 * 
 * @export
 * @interface ServerSettings
 */
export interface ServerSettings {
    /**
     * 
     * @type {string}
     * @memberof ServerSettings
     */
    shoppingMinAutosyncInterval: string;
    /**
     * 
     * @type {boolean}
     * @memberof ServerSettings
     */
    enablePdfExport: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof ServerSettings
     */
    disableExternalConnectors: boolean;
    /**
     * 
     * @type {string}
     * @memberof ServerSettings
     */
    termsUrl: string;
    /**
     * 
     * @type {string}
     * @memberof ServerSettings
     */
    privacyUrl: string;
    /**
     * 
     * @type {string}
     * @memberof ServerSettings
     */
    imprintUrl: string;
    /**
     * 
     * @type {boolean}
     * @memberof ServerSettings
     */
    hosted: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof ServerSettings
     */
    debug: boolean;
    /**
     * 
     * @type {string}
     * @memberof ServerSettings
     */
    version: string;
}

/**
 * Check if a given object implements the ServerSettings interface.
 */
export function instanceOfServerSettings(value: object): value is ServerSettings {
    if (!('shoppingMinAutosyncInterval' in value) || value['shoppingMinAutosyncInterval'] === undefined) return false;
    if (!('enablePdfExport' in value) || value['enablePdfExport'] === undefined) return false;
    if (!('disableExternalConnectors' in value) || value['disableExternalConnectors'] === undefined) return false;
    if (!('termsUrl' in value) || value['termsUrl'] === undefined) return false;
    if (!('privacyUrl' in value) || value['privacyUrl'] === undefined) return false;
    if (!('imprintUrl' in value) || value['imprintUrl'] === undefined) return false;
    if (!('hosted' in value) || value['hosted'] === undefined) return false;
    if (!('debug' in value) || value['debug'] === undefined) return false;
    if (!('version' in value) || value['version'] === undefined) return false;
    return true;
}

export function ServerSettingsFromJSON(json: any): ServerSettings {
    return ServerSettingsFromJSONTyped(json, false);
}

export function ServerSettingsFromJSONTyped(json: any, ignoreDiscriminator: boolean): ServerSettings {
    if (json == null) {
        return json;
    }
    return {
        
        'shoppingMinAutosyncInterval': json['shopping_min_autosync_interval'],
        'enablePdfExport': json['enable_pdf_export'],
        'disableExternalConnectors': json['disable_external_connectors'],
        'termsUrl': json['terms_url'],
        'privacyUrl': json['privacy_url'],
        'imprintUrl': json['imprint_url'],
        'hosted': json['hosted'],
        'debug': json['debug'],
        'version': json['version'],
    };
}

export function ServerSettingsToJSON(value?: ServerSettings | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'shopping_min_autosync_interval': value['shoppingMinAutosyncInterval'],
        'enable_pdf_export': value['enablePdfExport'],
        'disable_external_connectors': value['disableExternalConnectors'],
        'terms_url': value['termsUrl'],
        'privacy_url': value['privacyUrl'],
        'imprint_url': value['imprintUrl'],
        'hosted': value['hosted'],
        'debug': value['debug'],
        'version': value['version'],
    };
}

