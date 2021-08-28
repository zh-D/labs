const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'webpack-numbers.js',
        library: {
            name: 'webpackNumbers',
            type: 'umd',
        },
        externals: {
            lodash: {
                commonjs: 'lodash',
                commonjs2: 'lodash',
                amd: 'lodash',
                root: '_',
            },
        },
    },
};

// const path = require('path');

// module.exports = (env) => {
//   // Use env.<YOUR VARIABLE> here:
//   console.log('Goal: ', env.goal); // 'local'
//   console.log('Production: ', env.production); // true

//   return {
//     entry: './src/index.js',
//     output: {
//       filename: 'bundle.js',
//       path: path.resolve(__dirname, 'dist'),
//     },
//   };
// };
