const getBuiltInPlugins = () => {
    const pkg = require('../package.json');
    process.env.__FRAMEWORK_VERSION__ = pkg.version;
    const coreOptions = {
        'framework': 'react',
        'alias': process.env.__FRAMEWORK_NAME__ || 'ice'
    }
    const plugins = [
        // common plugins
        ['build-plugin-app-core', coreOptions],

        // react base plugin
        'build-plugin-react-app',

        // for ice/miniapp plugins
        'build-plugin-miniapp',

        // for ice/react plugins
        'build-plugin-ice-router',
        'build-plugin-ice-helpers',
        'build-plugin-ice-logger',
        'build-plugin-ice-config',
        'build-plugin-ice-mpa',
        'build-plugin-ice-request',
        'build-plugin-helmet',

        // build-plugin-ice-store
        'build-plugin-ice-store',
        // auth
        'build-plugin-ice-auth'
    ];
    return plugins;
}