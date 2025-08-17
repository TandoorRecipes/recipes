import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

/**
 * round to the number of decimals specified in user preferences
 * @param num number to round
 */
export function roundDecimals(num: number) {
    let decimals = useUserPreferenceStore().userSettings.ingredientDecimals
    return Number(num.toFixed(decimals))
}

/**
 * calculates the amount of food, based on the factor and converts it to a fraction if that is the users preference
 * @param amount food amount to calculate based upon
 * @param factor factor to scale food amount by
 * @param useFractions if the returned value should be a fraction or not
 */
export function calculateFoodAmount(amount: number, factor: number, useFractions: boolean = false) {
    if (useFractions) {
        let return_string = ""
        let fraction = frac(amount * factor, 16, true)

        if (fraction[0] === 0 && fraction[1] === 0 && fraction[2] === 1) {
            return roundDecimals(amount * factor)
        }

        if (fraction[0] > 0) {
            return_string += fraction[0]
        }

        if (fraction[1] > 0) {
            return_string += ` <sup>${fraction[1]}</sup>&frasl;<sub>${fraction[2]}</sub>`
        }

        return return_string
    } else {
        return roundDecimals(amount * factor)
    }
}


/* frac.js (C) 2012-present SheetJS -- http://sheetjs.com */

/* https://www.npmjs.com/package/frac Apache license*/
/**
 * calculates the closest approximation of a fraction for a given decimal number
 * @param x decimal number to convert into fraction
 * @param D the maximum denominator to return
 * @param mixed true to return mixed fractions (e.g. 2 1/2) or false to return improper fractions (e.g. 5/2)
 * @returns [quot, num, den] array of numbers, quot is either 0 for improper fractions or the whole number, num is the numerator of the fraction and den the denominator
 */
export function frac(x, D, mixed) {
    let n1 = Math.floor(x), d1 = 1;
    let n2 = n1 + 1, d2 = 1;
    if (x !== n1) while (d1 <= D && d2 <= D) {
        let m = (n1 + n2) / (d1 + d2);
        if (x === m) {
            if (d1 + d2 <= D) {
                d1 += d2;
                n1 += n2;
                d2 = D + 1;
            } else if (d1 > d2) d2 = D + 1;
            else d1 = D + 1;
            break;
        } else if (x < m) {
            n2 = n1 + n2;
            d2 = d1 + d2;
        } else {
            n1 = n1 + n2;
            d1 = d1 + d2;
        }
    }
    if (d1 > D) {
        d1 = d2;
        n1 = n2;
    }
    if (!mixed) return [0, n1, d1];
    let q = Math.floor(n1 / d1);
    return [q, n1 - q * d1, d1];
}