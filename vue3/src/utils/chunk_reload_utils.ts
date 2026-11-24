import type {Router} from "vue-router";

// session storage flag limits recovery to a single reload so a permanently missing chunk can't cause a reload loop
const chunkReloadKey = 'tandoor-chunk-reload'

/**
 * recover from lazy loaded route chunks that can no longer be fetched (e.g. old hashed files deleted after a new deployment)
 * @param router router to attach the recovery handlers to
 */
export function setupChunkReloadRecovery(router: Router) {
    // route currently being navigated to, needed because vite:preloadError does not know the target route
    let pendingRoute: string | null = null
    // prevents afterEach from clearing the reload flag while the recovery reload is already in progress
    let chunkReloadTriggered = false

    // full page load of the target route so the browser gets fresh html with the new chunk names instead of falling back to the old page
    function reloadAfterChunkError(path: string) {
        chunkReloadTriggered = true
        if (!sessionStorage.getItem(chunkReloadKey)) {
            sessionStorage.setItem(chunkReloadKey, '1')
            window.location.assign(path)
        }
    }

    router.beforeEach((to) => {
        pendingRoute = to.fullPath
    })

    // dynamic import of a route component failed (messages differ between chrome, safari and firefox)
    router.onError((error, to) => {
        const message = error instanceof Error ? error.message : String(error)
        if (/Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(message)) {
            pendingRoute = to.fullPath
            reloadAfterChunkError(to.fullPath)
        }
    })

    // navigation succeeded, reset so a future deployment can trigger recovery again
    router.afterEach(() => {
        pendingRoute = null
        if (!chunkReloadTriggered) sessionStorage.removeItem(chunkReloadKey)
    })

    // vite failed to preload js/css dependencies of a chunk, prevent the default error and reload the target route instead
    window.addEventListener('vite:preloadError', (event) => {
        event.preventDefault()
        reloadAfterChunkError(pendingRoute ?? window.location.href)
    })
}
