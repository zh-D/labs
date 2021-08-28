This article tells you how to build faster.

To build faster, you should:

- use latest version of webpack
- use latest version of node
- use latest version of npm/yarn

For webpack, you should distinguish mode.

## General

### Apply loaders to the minimal number of modules necessary. 

Instead of

```javascript
module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
    ],
  },
};
```

Use include

```javascript
const path = require('path');

module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'babel-loader',
      },
    ],
  },
};
```

### Each additional loader/plugin has a bootup time. Try to use as few tools as possible.

### Resolving

- Minimize the number of items in `resolve.modules`, `resolve.extensions`, `resolve.mainFiles`, `resolve.descriptionFiles`, as they increase the number of filesystem calls.
- Set `resolve.symlinks: false` if you don't use symlinks (e.g. `npm link` or `yarn link`).

- Set `resolve.cacheWithContext: false` if you use custom resolving plugins, that are not context specific.

### Dlls

Use the `DllPlugin` to move code that is changed less often into a separate compilation. This will improve the application's compilation speed, although it does increase complexity of the build process.

### Smaller = Faster

- Use fewer/smaller libraries.
- Use the `SplitChunksPlugin` in Multi-Page Applications.
- Use the `SplitChunksPlugin` in `async` mode in Multi-Page Applications.
- Remove unused code.
- Only compile the part of the code you are currently developing on.

### Worker Pool

The `thread-loader` can be used to offload expensive loaders to a worker pool

- Don't use too many workers, as there is a boot overhead for the Node.js runtime and the loader. Minimize the module transfers between worker and main process. IPC is expensive.

### Persistent cache

Use [`cache`](https://webpack.js.org/configuration/cache) option in webpack configuration. Clear cache directory on `"postinstall"` in `package.json`.

Tip

### Custom plugins/loaders

Profile them to not introduce a performance problem here.

### Progress plugin(what's this)

It is possible to shorten build times by removing `ProgressPlugin` from webpack's configuration. Keep in mind, `ProgressPlugin` might not provide as much value for fast builds as well, so make sure you are leveraging the benefits of using it.

## Development

### Incremental Builds

Use webpack's watch mode. Don't use other tools to watch your files and invoke webpack. The built-in watch mode will keep track of timestamps and passes this information to the compilation for cache invalidation.

In some setups, watching falls back to polling mode. With many watched files, this can cause a lot of CPU load. In these cases, you can increase the polling interval with `watchOptions.poll`.

### Compile in Memory

The following utilities improve performance by compiling and serving assets in memory rather than writing to disk:

- webpack-dev-server
- webpack-hot-middleware
- webpack-dev-middleware

### stats.toJson speed

Webpack 4 outputs a large amount of data with its `stats.toJson()` by default. Avoid retrieving portions of the `stats` object unless necessary in the incremental step. `webpack-dev-server` after v3.1.3 contained a substantial performance fix to minimize the amount of data retrieved from the `stats` object per incremental build step.

### Devtool

Be aware of the performance differences between the different `devtool` settings.

- `"eval"` has the best performance, but doesn't assist you for transpiled code.
- The `cheap-source-map` variants are more performant if you can live with the slightly worse mapping quality.
- Use a `eval-source-map` variant for incremental builds.

In most cases, `eval-cheap-module-source-map` is the best option.

### Avoid Production Specific Tooling

Certain utilities, plugins, and loaders only make sense when building for production. For example, it usually doesn't make sense to minify and mangle your code with the `TerserPlugin` while in development. These tools should typically be excluded in development:

- `TerserPlugin`
- `[fullhash]`/`[chunkhash]`/`[contenthash]`
- `AggressiveSplittingPlugin`
- `AggressiveMergingPlugin`
- `ModuleConcatenationPlugin`

### Minimal Entry Chunk

Webpack only emits updated chunks to the filesystem. For some configuration options, (HMR, `[name]`/`[chunkhash]`/`[contenthash]` in `output.chunkFilename`, `[fullhash]`) the entry chunk is invalidated in addition to the changed chunks.

Make sure the entry chunk is cheap to emit by keeping it small. The following configuration creates an additional chunk for the runtime code, so it's cheap to generate:

```javascript
module.exports = {
  // ...
  optimization: {
    runtimeChunk: true,
  },
};
```

### Avoid Extra Optimization Steps

Webpack does extra algorithmic work to optimize the output for size and load performance. These optimizations are performant for smaller codebases, but can be costly in larger ones:

```javascript
module.exports = {
  // ...
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
};
```

### Output Without Path Info

Webpack has the ability to generate path info in the output bundle. However, this puts garbage collection pressure on projects that bundle thousands of modules. Turn this off in the `options.output.pathinfo` setting:

```javascript
module.exports = {
  // ...
  output: {
    pathinfo: false,
  },
};
```

### TypeScript Loader

To improve the build time when using `ts-loader`, use the `transpileOnly` loader option. On its own, this option turns off type checking. To gain type checking again, use the [`ForkTsCheckerWebpackPlugin`](https://www.npmjs.com/package/fork-ts-checker-webpack-plugin). This speeds up TypeScript type checking and ESLint linting by moving each to a separate process.

```javascript
module.exports = {
  // ...
  test: /\.tsx?$/,
  use: [
    {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  ],
};
```

## Production

### Multiple Compilations

- [`parallel-webpack`](https://github.com/trivago/parallel-webpack): It allows for compilation in a worker pool.

- `cache-loader`: The cache can be shared between multiple compilations.

### Source Maps

Source maps are really expensive. Do you really need them?

## Specific Tooling Issues

The following tools have certain problems that can degrade build performance:

### Babel

- Minimize the number of preset/plugins

### TypeScript

- Use the `fork-ts-checker-webpack-plugin` for typechecking in a separate process.

- Configure loaders to skip typechecking.

- Use the `ts-loader` in `happyPackMode: true` / `transpileOnly: true`.

### Sass

- `node-sass` has a bug which blocks threads from the Node.js thread pool. When using it with the `thread-loader` set `workerParallelJobs: 2`.