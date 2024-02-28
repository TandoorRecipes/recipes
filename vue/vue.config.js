const BundleTracker = require("webpack-bundle-tracker")

const pages = {
    recipe_search_view: {
        entry: "./src/apps/RecipeSearchView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    recipe_view: {
        entry: "./src/apps/RecipeView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    offline_view: {
        entry: "./src/apps/OfflineView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    import_view: {
        entry: "./src/apps/ImportView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    import_response_view: {
        entry: "./src/apps/ImportResponseView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    export_response_view: {
        entry: "./src/apps/ExportResponseView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    export_view: {
        entry: "./src/apps/ExportView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    model_list_view: {
        entry: "./src/apps/ModelListView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    edit_internal_recipe: {
        entry: "./src/apps/RecipeEditView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    cookbook_view: {
        entry: "./src/apps/CookbookView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    meal_plan_view: {
        entry: "./src/apps/MealPlanView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    ingredient_editor_view: {
        entry: "./src/apps/IngredientEditorView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    property_editor_view: {
        entry: "./src/apps/PropertyEditorView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    shopping_list_view: {
        entry: "./src/apps/ShoppingListView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    space_manage_view: {
        entry: "./src/apps/SpaceManageView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    settings_view: {
        entry: "./src/apps/SettingsView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    },
    test_view: {
        entry: "./src/apps/TestView/main.js",
        chunks: ["chunk-vendors","locales-chunk","api-chunk"],
    }
}

module.exports = {
    pages: pages,
    filenameHashing: false,
    productionSourceMap: false,
    publicPath: process.env.NODE_ENV === "production" ? "" : "http://localhost:8080/",
    outputDir: "../cookbook/static/vue/",
    runtimeCompiler: true,
    pwa: {
        name: "Recipes",
        themeColor: "#4DBA87",
        msTileColor: "#000000",
        appleMobileWebAppCapable: "yes",
        appleMobileWebAppStatusBarStyle: "black",

        workboxPluginMode: "InjectManifest",
        workboxOptions: {
            swSrc: "./src/sw.js",
            swDest: "../../templates/sw.js",
            manifestTransforms: [
                (originalManifest) => {
                    const result = originalManifest.map((entry) => new Object({url: "static/vue/" + entry.url}))
                    return {manifest: result, warnings: []}
                },
            ],
        },
    },
    pluginOptions: {
        i18n: {
            locale: "en",
            fallbackLocale: "en",
            localeDir: "locales",
            enableInSFC: true,
        },
    },
    chainWebpack: (config) => {
        config.optimization.splitChunks(
            {
                cacheGroups: {
                    locale: {
                        test: /[\\/]src[\\/]locales[\\/]/,
                        name: "locales-chunk",
                        chunks: "all",
                        priority: 3,
                    },
                    api: {
                        test: /[\\/]src[\\/]utils[\\/]openapi[\\/]/,
                        name: "api-chunk",
                        chunks: "all",
                        priority: 3,
                    },
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "chunk-vendors",
                        chunks: "all",
                        priority: 1,
                    },
                },
            },
        )

        config.optimization.minimize(true)

        //TODO somehow remove them as they are also added to the manifest config of the service worker
        /*
        Object.keys(pages).forEach(page => {
            config.plugins.delete(`html-${page}`);
            config.plugins.delete(`preload-${page}`);
            config.plugins.delete(`prefetch-${page}`);
        })
        */

        config.plugin("BundleTracker").use(BundleTracker, [{relativePath: true, path: "../vue/"}])

        config.resolve.alias.set("__STATIC__", "static")

        config.devServer
            .host("localhost")
            .port(8080)
            .set('hot', 'only')
            .set('static', {watch: true})
            // old webpack dev server v3 settings
            //  .hotOnly(true)
            //   .watchOptions({ poll: 500 })
            //  .public("http://localhost:8080")
            .https(false)
            .headers({"Access-Control-Allow-Origin": ["*"]})
    },
}
