/// <reference types="vite/client" />

declare module 'virtual:locale-coverage' {
    /** Coverage data for all locales: filename stem → {fe: %, be: %} */
    export const coverage: Record<string, {fe: number, be: number}>
    /** Set of locale filename stems meeting the minimum FE coverage threshold */
    export const qualified: Set<string>
    /** The minimum FE coverage threshold (%) */
    export const minCoverage: number
}
