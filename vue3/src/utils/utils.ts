/**
 * Gets a nested property of an object given a dot-notation path.
 *
 * @param object The object to access the property from.
 * @param path The dot-notation path to the property.
 * @returns The value of the nested property, or `undefined` if not found.
 */
export function getNestedProperty(object: any, path: string): any {
  const pathParts = path.split('.');

  return pathParts.reduce((obj, key) => {
    if (obj && typeof obj === 'object') {
      return obj[key]
    } else {
      return undefined;
    }
  }, object);
}