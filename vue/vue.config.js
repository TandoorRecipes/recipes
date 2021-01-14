const BundleTracker = require("webpack-bundle-tracker");

const pages = {
    'recipe_view': {
        entry: './src/apps/RecipeView/main.js',
        chunks: ['chunk-vendors']
    },
    'service_worker': {
        entry: './src/serviceWorker.js',
        chunks: ['chunk-vendors']
    },
}

module.exports = {
    pages: pages,
    filenameHashing: false,
    productionSourceMap: false,
    publicPath: process.env.NODE_ENV === 'production'
        ? ''
        : 'http://localhost:8080/',
    outputDir: '../cookbook/static/vue/',
    runtimeCompiler: true,

    pwa: {
        name: 'Recipes',
        themeColor: '#4DBA87',
        msTileColor: '#000000',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',

        workboxPluginMode: 'GenerateSW',
        workboxOptions: {
            offlineGoogleAnalytics: false,
            inlineWorkboxRuntime: true,

        }
    },
    chainWebpack: config => {

        config.optimization.splitChunks({
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "chunk-vendors",
                    chunks: "all",
                    priority: 1
                },
            },
        });

        Object.keys(pages).forEach(page => {
            config.plugins.delete(`html-${page}`);
            config.plugins.delete(`preload-${page}`);
            config.plugins.delete(`prefetch-${page}`);
        })

        config
            .plugin('BundleTracker')
            .use(BundleTracker, [{filename: '../vue/webpack-stats.json'}]);

        config.resolve.alias
            .set('__STATIC__', 'static')

        config.devServer
            .public('http://localhost:8080')
            .host('localhost')
            .port(8080)
            .hotOnly(true)
            .watchOptions({poll: 500})
            .https(false)
            .headers({"Access-Control-Allow-Origin": ["*"]})

    }
};