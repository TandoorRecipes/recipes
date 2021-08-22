/* frac.js (C) 2012-present SheetJS -- http://sheetjs.com */

/* https://www.npmjs.com/package/frac Apache license*/
export function frac(x, D, mixed) {
    var n1 = Math.floor(x), d1 = 1;
    var n2 = n1 + 1, d2 = 1;
    if (x !== n1) while (d1 <= D && d2 <= D) {
        var m = (n1 + n2) / (d1 + d2);
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
    var q = Math.floor(n1 / d1);
    return [q, n1 - q * d1, d1];
}

export function cont(x, D, mixed) {
    var sgn = x < 0 ? -1 : 1;
    var B = x * sgn;
    var P_2 = 0, P_1 = 1, P = 0;
    var Q_2 = 1, Q_1 = 0, Q = 0;
    var A = Math.floor(B);
    while (Q_1 < D) {
        A = Math.floor(B);
        P = A * P_1 + P_2;
        Q = A * Q_1 + Q_2;
        if ((B - A) < 0.00000005) break;
        B = 1 / (B - A);
        P_2 = P_1;
        P_1 = P;
        Q_2 = Q_1;
        Q_1 = Q;
    }
    if (Q > D) {
        if (Q_1 > D) {
            Q = Q_2;
            P = P_2;
        } else {
            Q = Q_1;
            P = P_1;
        }
    }
    if (!mixed) return [0, sgn * P, Q];
    var q = Math.floor(sgn * P / Q);
    return [q, sgn * P - q * Q, Q];
}