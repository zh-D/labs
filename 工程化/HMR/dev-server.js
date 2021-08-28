// style-loader can hmr css
const webpack = require('webpack');
const DevServer = require('webpack-dev-server');
const config = {
  entry: [
    // Runtime code for hot module replacement
    'webpack/hot/dev-server.js',
    // Dev server client for web socket transport, hot and live reload logic
    'webpack-dev-server/client/index.js?hot=true&live-reload=true',
    // Your entry
    './src/entry.js',
  ],
  plugin: [
    // Plugin for hot module replacement
    new webpack.HotModuleReplacementPlugin(),
  ],
};
const compiler = webpack(config);
// `hot` and `client` options are disabled because we added them manually
const server = new DevServer({ hot: false, client: false }, compiler);

(async () => {
  await server.start();
  console.log('dev server is running');
})();
