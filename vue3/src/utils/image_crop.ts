/**
 * Computes an object-position string from UserFile.cropData for use with
 * Vuetify's v-img :position prop. The focal point is the center of the
 * crop region, which keeps the subject visible when object-fit: cover
 * fills a smaller container.
 *
 * Returns undefined when cropData is null/undefined (no-op for Vuetify).
 */
export function cropPosition(cropData: Record<string, number> | null | undefined): string | undefined {
    if (!cropData) return undefined
    const x = cropData['x']
    const y = cropData['y']
    const w = cropData['width']
    const h = cropData['height']
    if (x == null || y == null || w == null || h == null) return undefined
    const focalX = Math.round((x + w / 2) * 100) / 100
    const focalY = Math.round((y + h / 2) * 100) / 100
    return `${focalX}% ${focalY}%`
}

/**
 * Computes CSS background styles that zoom into the crop region of an image.
 * The image is scaled so the crop region fills the container (cover behavior),
 * then positioned so the crop region is centered in the container.
 *
 * Uses background-size with a single percentage value (width-based, height auto)
 * to maintain the image's natural aspect ratio while zooming in.
 *
 * Returns a CSS style object suitable for use with :style binding on a div
 * that has overflow: hidden and fixed dimensions.
 */
/**
 * Computes CSS background styles for displaying the cropped region of an image.
 *
 * Behavior:
 *  - When `forceCrop=true` (square thumbnails): always returns zoom-into-crop
 *    styles (the cropped square fills the container). The fit flag is ignored.
 *  - When `forceCrop=false` (non-square containers like cards/banners):
 *    - cropData.fit=true → returns zoom-into-crop styles. The consumer is
 *      responsible for wrapping the element in a centered square container
 *      (e.g. via `container-type: size` + `100cqmin`) so the cropped square
 *      is letterboxed inside the non-square frame.
 *    - cropData.fit=false → returns cover styles with the crop region's center
 *      as the focal point (full image visible, focal hint applied).
 *
 * Returns a CSS style object suitable for use with :style binding on a div
 * that has overflow: hidden and fixed dimensions.
 */
export function cropPreviewStyle(
    src: string,
    cropData: Record<string, number> | null | undefined,
    forceCrop = false,
): Record<string, string> {
    if (!cropData || !src) {
        return {
            backgroundImage: `url("${src}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }
    }

    const x = cropData['x'] ?? 0
    const y = cropData['y'] ?? 0
    const w = cropData['width'] ?? 100
    const h = cropData['height'] ?? 100
    const showCrop = forceCrop || !!cropData['fit']

    if (!showCrop) {
        // Cover with focal point — full image, crop region centered
        const focalX = Math.round((x + w / 2) * 100) / 100
        const focalY = Math.round((y + h / 2) * 100) / 100
        return {
            backgroundImage: `url("${src}")`,
            backgroundSize: 'cover',
            backgroundPosition: `${focalX}% ${focalY}%`,
        }
    }

    // Zoom into the crop region so the cropped square fills the container.
    //
    // CSS `background-position` percentage spec: P% positions the image
    // so its P% point aligns with the container's P% point. When the
    // image is scaled so the crop spans exactly the container, the
    // formula to make the visible region exactly the saved crop is:
    //     posX = x / (100 - w) * 100
    // (and same for y/h). At w=100 / h=100 there's no scrolling room so
    // posX / posY default to 0% (position is irrelevant when image fills
    // the container in that axis).
    //
    // backgroundSize handling:
    //   • w > 100 (crop wider than image, horizontal padding bars):
    //     image fills container HEIGHT exactly — `auto 100%`.
    //   • h > 100 (crop taller than image, vertical padding bars):
    //     image fills container WIDTH exactly — `100% auto`.
    //   • w ≤ 100 AND h ≤ 100 (crop inside image, zoom): standard
    //     `${100/w * 100}%` width-anchored zoom.
    //
    // No clamp on position values — overflow crops produce legitimate
    // negative or >100 backgroundPosition values that render as padding
    // bars filled by the consumer's container background-color.
    const round = (v: number) => Math.round(v * 100) / 100
    const position = (coord: number, dim: number): number => {
        const denom = 100 - dim
        return denom === 0 ? 0 : round(coord / denom * 100)
    }
    const posX = position(x, w)
    const posY = position(y, h)

    let backgroundSize: string
    if (w > 100) {
        backgroundSize = 'auto 100%'
    } else if (h > 100) {
        backgroundSize = '100% auto'
    } else {
        const bgSize = w > 0 ? Math.round(100 / w * 10000) / 100 : 100
        backgroundSize = `${bgSize}%`
    }

    return {
        backgroundImage: `url("${src}")`,
        backgroundSize,
        backgroundPosition: `${posX}% ${posY}%`,
        backgroundRepeat: 'no-repeat',
    }
}

/**
 * Returns true when the cropData indicates fit-to-frame mode AND the consumer
 * is rendering a non-square container (forceCrop=false). Consumers can use
 * this to know whether to wrap the image element in a square inner container.
 */
export function shouldFitFrame(
    cropData: Record<string, number> | null | undefined,
    forceCrop = false,
): boolean {
    return !forceCrop && !!cropData?.['fit']
}
