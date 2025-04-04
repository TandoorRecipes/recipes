/**
 * helper function to use django urls while respecting sub path setups
 * only needed as long as not all pages are integrated into the Vue.js frontend (which might be forever...)
 */
export function useDjangoUrls() {
    const basePath = localStorage.getItem('BASE_PATH')

    /**
     * given a path return the full server url to that url respecting possible sub path setups
     * @param path
     * @param appendSlash automatically append a slash to the end of the url (default true)
     */
    function getDjangoUrl(path: string, appendSlash = true){
        if(path.startsWith('/')){
            path = path.substring(1)
        }
        if(!path.endsWith('/') && appendSlash){
            path = path + '/'
        }

        return `${basePath}/${path}`
    }

    return {basePath, getDjangoUrl}
}