


https://pinia.vuejs.org/core-concepts/plugins.html#adding-new-state


export function BaseStorePlugin () {
    return {
        collection: [],
        item: {},
        getCollection: function (url) {
            api.get(url)
                .then((response) => {
                    this.collection = response.data;
                })
                .catch((error) => {
                    this.handleError(error);
                });
        },
        getItem: function (url) {
            api.get(url)
                .then((response) => {
                    this.item = response.data;
                })
                .catch((error) => {
                    this.handleError(error);
                });
        },
        handleError: function (error) {
            window.alert(error);
        },
    };
}