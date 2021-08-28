What we've learned is that in order to take advantage of *tree shaking*, you must...

- Use ES2015 module syntax (i.e. `import` and `export`).
- Ensure no compilers transform your ES2015 module syntax into CommonJS modules (this is the default behavior of the popular Babel preset @babel/preset-env - see the [documentation](https://babeljs.io/docs/en/babel-preset-env#modules) for more details).
- Add a `"sideEffects"` property to your project's `package.json` file.
- Use the [`production`](https://webpack.js.org/configuration/mode/#mode-production) `mode` configuration option to enable [various optimizations](https://webpack.js.org/configuration/mode/#usage) including minification and tree shaking.