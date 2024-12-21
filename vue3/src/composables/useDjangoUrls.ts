/**
 * helper function to use django urls while respecting sub path setups
 * only needed as long as not all pages are integrated into the Vue.js frontend (which might be forever...)
 */
export function useDjangoUrls() {
    const basePath = localStorage.getItem('BASE_PATH')

    /**
     * given a path return the full server url to that url respecting possible sub path setups
     * @param path
     */
    function getDjangoUrl(path: string){
        if(path.charAt(0) == '/'){
            path = path.substring(1)
        }

        return `${basePath}/${path}`
    }

    return {basePath, getDjangoUrl}
}