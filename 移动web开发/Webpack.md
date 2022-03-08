### 为什么用 webpack

- 在网页中会有 js（.js、.jsx、.coffe、.ts）、css（.css、.less、.sass、.scss）、images（.jpg、.png、.gif、.bmp、.svg）、字体文件（.svg、.ttf、.eot、.woff、.woff2）、模板文件（.ejs、.jade、.vue）
- 网页加载速度慢，因为要处理很多二次请求
- webpack 能合并、压缩、小图片编码 base64 等，能减少二次请求（精灵图）
- webpack 能够处理错综复杂的依赖关系

gulp 小巧、如果项目太大，需要建的任务更多、webpack 基于整个项目来进行构建，会更简单

### Entry && Output 的概念

entry 就是依赖图的入口

```javascript
// 单入口，单 html
module.exports = {
    entry: "./path/to/my/entry/file.js"
}

// 多入口，多 html
module.exports = {
    entry: {
        app: "./src/app.js",
        adminApp: "./src/adminApp.js"
    }
}

```

output 指定打包的一个输出文件名和 path

```javascript
output: {
    // 多入口需要占位符
    filename: "[name].js",
    path: path.join(__dirname, 'dist')
}
```

### Mode 的概念

Mode 用来指定当前的构建环境是： production、development 还是 none。默认为 production。

- development：设置 process.env.NODE_ENV 的值为 development。开启 NamedChunksPlugin 和 NamedModulesPlugin
- production：设置 process.env.NODE_ENV 的值为 production。开启 FlagDependencyPlugin、FlagIncludedChunksPlugin、ModuleConcatenationPlugin、NoEmitOnErrorsPlugin，OccurenceOrderPlugin、SideEffectsFlagPlugin 和 TerserPlugin
- none：什么都不开启

### Loader 的概念

webpack 默认只支持 JS、JSON 两种文件类型，要通过 Loaders 去支持其它文件类型并且把它们转化成有效的模块，并且可以添加到依赖图中

常用 loader 有：

- babel-loader：转换 ES6、ES7 等新语法
- css-loader：使 webpack 支持加载 css
- less-loader：将 less 转化为 css
- ts-loader：将 TS 转化为 JS
- file-loader：进行图片、字体等的打包
- raw-loader：将文件以字符串的形式导入
- thread-loader：多进程打包 JS 和 CSS

### Plugin 的概念

插件用于 bundle 文件的优化，资源管理和环境变量的注入，作用于整个构建过程。

常用的 plugin 有：

- CommonsChunkPlugin：将 chunks 相同的模块代码提取成公共 js
- CleanWebpackPlugin：清理构建目录
- ExtractTextWebpackPlugin：将 CSS 从 bundle 文件里提取成一个独立的 CSS 文件
- CopyWebpackPlugin：将文件或者文件夹拷贝到构建的输出目录
- HtmlWebpackPlugin：创建 html 文件去承载输出的 bundle
- UglifyjsWebpackPlugin：压缩 JS
- ZipWebpackPlugin：将打包出的资源生成一个 zip 包

### CSS loader

```javascript
module: {
    rules: [
        // 调用顺序从右到左。style-loader 是把 css 放到 header 里面，可以使用 MiniCssExtratPlugin.loader 单独提取出来
        { test: /\.css$/, use: ["style-loader", "css-loader"] },
        { test: /\.less$/, use: ["style-loader", "css-loader", "less-loader"] },
        { test: /\.sass$/, use: ["style-loader", "css-loader", "sass-loader"] }
    ]
}
```

### Url loader

url loader 可以处理图片和字体文件

```javascript
module: {
    rules: [
        // 默认转 base 64(如设置了 limit。则小于 limit 使用 base64，大于等于 limit 使用路径)
        { test: /\.(jpg|png|gif|bmp|jpeg)$/, use: "url-loader?limit=7632&name=[name]-[hash:8].[ext]" },
        { test: /\.(ttf|eot|svg|woff|woff2)$/, use: "url-loader" }
    ]
}
```

### Babel 转换 ES6 语法

```javascript
npm i babel-core babel-loader babel-plugin-transform-runtime -D
npm i babel-presetenv babel-preset-stage-0 -D
```

```javascript
// webpack.config.js
{
    test: /\.js$/, use: 'babel-loader', exclude: /node_modules/
}
```

```javascript
// .babelrc
{
    "presets": ["env", "stage-0"],
    "plugins": ["transform-runtime"]
}
```

### webpack 开启文件监听

> 文件监听就是发现源码发生变化时，自动重新构建出新的输出文件
>
> 缺点就是要手动刷新浏览器

- 启动 webpack 时，带上 --watch 参数

```javascript
"scripts": {
    "build": "webpack",
    "watch": "webpack --watch"
}
```

在配置 webpack.config.js 中设置 watch: true

```javascript
module.export = {
    watch: true,
    watchOptions: {
        ignored: /node_modules/,
        // 默认 300ms，文件变化 300ms 后执行
        aggregateTimeout: 300,
        // 默认每秒问 1000 次
        poll: 1000
    }
}
```

### webpack-dev-server

> webpack-dev-server 能够监听代码的改变，帮我们自动打包到内存，而且自动刷新浏览器。

配置 webpack-dev-server

```javascript
webpack-dev-server --open --port 3000 --contentBase src --hot
```

或

```javascript
// hot 需要 webpack.HotModuleReplacementPlugin
const webpack = require("webpack")

module.exports = {
  devServer: {
    open: true,
    port: 3000,
    contentBase: "src",
    hot: true
  },
  plugins: [
      new webpack.HotModuleReplacementPlugin()
  ]
}
```

### 在 webpack 中使用 vue

```javascript
// 法一
import Vue from "../node_modules/vue/dist/vue.js"

// 法二：webpack
resolve: {
    alias: {
        "vue$": "vue/dist/vue.js"
    }
}
```

### 文件指纹策略

生成指纹的三种策略

- Hash：和整个项目的构建相关，只要项目文件有修改，整个项目的 hash 值就会修改
- ChunkHash：和 webpack 打包的 chunk 有关，不同的 entry 会生成不同的 chunkhash 值
- Contenthash：根据文件内容来定义 hash，文件内容不变，则 contenthash 不变

指纹生成：

```javascript
module.exports = {
    // JS 文件的 hash
    output: {
        filename: "[name][chunkhash:8].js",
        path: path.join(__dirname, "dist")
    },
    // CSS 文件的 hash
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name][contenthash:8].css"
      })
    ],
    // 图片的指纹设置
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: "img/[name][hash:8].[ext]"
                    }
                }]
            }
        ]
    }
}
```

### 文件压缩

分为 HTML、CSS、JS 的压缩

- 内置了 uglifyjs-webpack-plugin，默认是压缩 JS 的。
- 要压缩 css，要使用 optimize-css-assets-webpack-plugin，同时使用 cssnano

```javascript
module.exports = {
    plugins: [
        new OptimizeCSSAssetsPlugin({
            assetNameRegExp:/\.css$/g,
            cssProcessor: require("cssnano")
        })
    ]
}
```

- 要压缩 html，使用 html-webpack-plugins

```javascript
module.exports = {
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "src/search.html"),
            filename: 'search.html',
            chunks: ['search'],
            inject: true,
            minify: {
                html5: true,
                collapseWhitespace: true,
                preserveLineBreaks: false,
                minifyCSS: true,
                removeComments: false
            }
        }),
        // 另一个 html
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "src/search.html"),
            filename: 'search.html',
            chunks: ['search'],
            inject: true,
            minify: {
                html5: true,
                collapseWhitespace: true,
                preserveLineBreaks: false,
                minifyCSS: true,
                removeComments: false
            }
        })
    ]
}
```

### 自动清理构建产物目录

法一，npm scripts 清理构建目录

```javascript
rm -rf ./dist && webpack
rimraf ./dist && webpack
```

法二 使用 clean-webpack-plugin

```javascript
module.exports = {
    plugins: [
        new CleanWebpackPlugin()
    ]
}
```

### CSS3 属性加前缀

CSS3 属性为什么要加前缀？市面有多种多样的浏览器，内核可以分为四种，标准还没有完全统一。

```javascript
rules: [
    {
        test: /\.css$/,
        use: [
            "style-loader",
            "css-loader",
            {
                loader: "postcss-loader",
                options: {
                    plugins: () => {
                        require("autoprefixer")({
                            browsers: ["last 2 version", ">1%", "IOS 7"]
                        })
                    }
                }
            }
        ]
    }
]
```

### 移动端 px 自动转 rem

使用 px2rem-loader

还有 lib-flexible

```javascript
引入 lib-flexible，这个需要前置在 html 的顶部，它能计算 rem 的大小。

rules: [
    {
        test: /\.css$/,
        use: [
            "style-loader",
            "css-loader",
            {
                loader: "px2rem-loader",
                options: {
                    // 1 rem = 75px
                    remUnit: 75,
                    // px 转 rem 小数点位数
                    remPrecision: 8
                }
            }
        ]
    }
]
```

### 静态资源内联

**好处有：**

代码层面

- 页面框架的初始化脚本：如 lib-flexible
- 上报相关打点：css 初始化、js 初始化、js 加载完成等等
- css 内联避免页面闪动

请求层面，减少 HTTP 网络请求数

- 小图片或者字体内联(url-loader)

HTML 和 JS 内联：

raw-loader 使用 0.5.1 版本

- raw-loader 内联 html：script ${require("raw-loader!babel-loader!./meta.html")} script
- raw-loader 内联 JS：script ${require("raw-loader!babel-loader!../node_modules/lib-flexible")} script

CSS 内联使用 style-loader 或者 html-inline-css-webpack-plugin（更广泛）

```javascript
use: [
    {
        loader: "style-loader",
        options: {
            // 插入到 head 标签
            insertAt: "top",
            // 将所有 style 标签合并成一个
            singleton: true
        }
    }
]


```

###
