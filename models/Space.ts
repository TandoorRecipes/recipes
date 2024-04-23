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

import { exists, mapValues } from '../runtime';
import type { FoodInheritField } from './FoodInheritField';
import {
    FoodInheritFieldFromJSON,
    FoodInheritFieldFromJSONTyped,
    FoodInheritFieldToJSON,
} from './FoodInheritField';
import type { PatchedSpaceImage } from './PatchedSpaceImage';
import {
    PatchedSpaceImageFromJSON,
    PatchedSpaceImageFromJSONTyped,
    PatchedSpaceImageToJSON,
} from './PatchedSpaceImage';
import type { SpaceNavTextColorEnum } from './SpaceNavTextColorEnum';
import {
    SpaceNavTextColorEnumFromJSON,
    SpaceNavTextColorEnumFromJSONTyped,
    SpaceNavTextColorEnumToJSON,
} from './SpaceNavTextColorEnum';
import type { SpaceThemeEnum } from './SpaceThemeEnum';
import {
    SpaceThemeEnumFromJSON,
    SpaceThemeEnumFromJSONTyped,
    SpaceThemeEnumToJSON,
} from './SpaceThemeEnum';

/**
 * Adds nested create feature
 * @export
 * @interface Space
 */
export interface Space {
    /**
     * 
     * @type {number}
     * @memberof Space
     */
    readonly id: number;
    /**
     * 
     * @type {string}
     * @memberof Space
     */
    name?: string;
    /**
     * 
     * @type {number}
     * @memberof Space
     */
    readonly createdBy: number | null;
    /**
     * 
     * @type {Date}
     * @memberof Space
     */
    readonly createdAt: Date;
    /**
     * 
     * @type {string}
     * @memberof Space
     */
    message?: string;
    /**
     * 
     * @type {number}
     * @memberof Space
     */
    readonly maxRecipes: number;
    /**
     * Maximum file storage for space in MB. 0 for unlimited, -1 to disable file upload.
     * @type {number}
     * @memberof Space
     */
    readonly maxFileStorageMb: number;
    /**
     * 
     * @type {number}
     * @memberof Space
     */
    readonly maxUsers: number;
    /**
     * 
     * @type {boolean}
     * @memberof Space
     */
    readonly allowSharing: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof Space
     */
    readonly demo: boolean;
    /**
     * 
     * @type {Array<FoodInheritField>}
     * @memberof Space
     */
    foodInherit: Array<FoodInheritField>;
    /**
     * 
     * @type {number}
     * @memberof Space
     */
    readonly userCount: number;
    /**
     * 
     * @type {number}
     * @memberof Space
     */
    readonly recipeCount: number;
    /**
     * 
     * @type {number}
     * @memberof Space
     */
    readonly fileSizeMb: number;
    /**
     * 
     * @type {PatchedSpaceImage}
     * @memberof Space
     */
    image?: PatchedSpaceImage | null;
    /**
     * 
     * @type {PatchedSpaceImage}
     * @memberof Space
     */
    navLogo?: PatchedSpaceImage | null;
    /**
     * 
     * @type {SpaceThemeEnum}
     * @memberof Space
     */
    spaceTheme?: SpaceThemeEnum;
    /**
     * 
     * @type {PatchedSpaceImage}
     * @memberof Space
     */
    customSpaceTheme?: PatchedSpaceImage | null;
    /**
     * 
     * @type {string}
     * @memberof Space
     */
    navBgColor?: string;
    /**
     * 
     * @type {SpaceNavTextColorEnum}
     * @memberof Space
     */
    navTextColor?: SpaceNavTextColorEnum;
    /**
     * 
     * @type {PatchedSpaceImage}
     * @memberof Space
     */
    logoColor32?: PatchedSpaceImage | null;
    /**
     * 
     * @type {PatchedSpaceImage}
     * @memberof Space
     */
    logoColor128?: PatchedSpaceImage | null;
    /**
     * 
     * @type {PatchedSpaceImage}
     * @memberof Space
     */
    logoColor144?: PatchedSpaceImage | null;
    /**
     * 
     * @type {PatchedSpaceImage}
     * @memberof Space
     */
    logoColor180?: PatchedSpaceImage | null;
    /**
     * 
     * @type {PatchedSpaceImage}
     * @memberof Space
     */
    logoColor192?: PatchedSpaceImage | null;
    /**
     * 
     * @type {PatchedSpaceImage}
     * @memberof Space
     */
    logoColor512?: PatchedSpaceImage | null;
    /**
     * 
     * @type {PatchedSpaceImage}
     * @memberof Space
     */
    logoColorSvg?: PatchedSpaceImage | null;
}

/**
 * Check if a given object implements the Space interface.
 */
export function instanceOfSpace(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "createdBy" in value;
    isInstance = isInstance && "createdAt" in value;
    isInstance = isInstance && "maxRecipes" in value;
    isInstance = isInstance && "maxFileStorageMb" in value;
    isInstance = isInstance && "maxUsers" in value;
    isInstance = isInstance && "allowSharing" in value;
    isInstance = isInstance && "demo" in value;
    isInstance = isInstance && "foodInherit" in value;
    isInstance = isInstance && "userCount" in value;
    isInstance = isInstance && "recipeCount" in value;
    isInstance = isInstance && "fileSizeMb" in value;

    return isInstance;
}

export function SpaceFromJSON(json: any): Space {
    return SpaceFromJSONTyped(json, false);
}

export function SpaceFromJSONTyped(json: any, ignoreDiscriminator: boolean): Space {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': !exists(json, 'name') ? undefined : json['name'],
        'createdBy': json['created_by'],
        'createdAt': (new Date(json['created_at'])),
        'message': !exists(json, 'message') ? undefined : json['message'],
        'maxRecipes': json['max_recipes'],
        'maxFileStorageMb': json['max_file_storage_mb'],
        'maxUsers': json['max_users'],
        'allowSharing': json['allow_sharing'],
        'demo': json['demo'],
        'foodInherit': ((json['food_inherit'] as Array<any>).map(FoodInheritFieldFromJSON)),
        'userCount': json['user_count'],
        'recipeCount': json['recipe_count'],
        'fileSizeMb': json['file_size_mb'],
        'image': !exists(json, 'image') ? undefined : PatchedSpaceImageFromJSON(json['image']),
        'navLogo': !exists(json, 'nav_logo') ? undefined : PatchedSpaceImageFromJSON(json['nav_logo']),
        'spaceTheme': !exists(json, 'space_theme') ? undefined : SpaceThemeEnumFromJSON(json['space_theme']),
        'customSpaceTheme': !exists(json, 'custom_space_theme') ? undefined : PatchedSpaceImageFromJSON(json['custom_space_theme']),
        'navBgColor': !exists(json, 'nav_bg_color') ? undefined : json['nav_bg_color'],
        'navTextColor': !exists(json, 'nav_text_color') ? undefined : SpaceNavTextColorEnumFromJSON(json['nav_text_color']),
        'logoColor32': !exists(json, 'logo_color_32') ? undefined : PatchedSpaceImageFromJSON(json['logo_color_32']),
        'logoColor128': !exists(json, 'logo_color_128') ? undefined : PatchedSpaceImageFromJSON(json['logo_color_128']),
        'logoColor144': !exists(json, 'logo_color_144') ? undefined : PatchedSpaceImageFromJSON(json['logo_color_144']),
        'logoColor180': !exists(json, 'logo_color_180') ? undefined : PatchedSpaceImageFromJSON(json['logo_color_180']),
        'logoColor192': !exists(json, 'logo_color_192') ? undefined : PatchedSpaceImageFromJSON(json['logo_color_192']),
        'logoColor512': !exists(json, 'logo_color_512') ? undefined : PatchedSpaceImageFromJSON(json['logo_color_512']),
        'logoColorSvg': !exists(json, 'logo_color_svg') ? undefined : PatchedSpaceImageFromJSON(json['logo_color_svg']),
    };
}

export function SpaceToJSON(value?: Space | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'message': value.message,
        'food_inherit': ((value.foodInherit as Array<any>).map(FoodInheritFieldToJSON)),
        'image': PatchedSpaceImageToJSON(value.image),
        'nav_logo': PatchedSpaceImageToJSON(value.navLogo),
        'space_theme': SpaceThemeEnumToJSON(value.spaceTheme),
        'custom_space_theme': PatchedSpaceImageToJSON(value.customSpaceTheme),
        'nav_bg_color': value.navBgColor,
        'nav_text_color': SpaceNavTextColorEnumToJSON(value.navTextColor),
        'logo_color_32': PatchedSpaceImageToJSON(value.logoColor32),
        'logo_color_128': PatchedSpaceImageToJSON(value.logoColor128),
        'logo_color_144': PatchedSpaceImageToJSON(value.logoColor144),
        'logo_color_180': PatchedSpaceImageToJSON(value.logoColor180),
        'logo_color_192': PatchedSpaceImageToJSON(value.logoColor192),
        'logo_color_512': PatchedSpaceImageToJSON(value.logoColor512),
        'logo_color_svg': PatchedSpaceImageToJSON(value.logoColorSvg),
    };
}
