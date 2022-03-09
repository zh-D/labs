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

### 多页面打包方案

MPA 就是每一次页面跳转的时候，后台服务器返回新的 html

- 页面之间解耦
- seo 友好

动态获取 entry 和设置 html-webpack-plugin

```javascript
const setMPA = () => {
    const entry = {};
    const htmlWebpackPlugins = []
    const entryFiles = glob.sync(path.join(__dirname, "./src/*/index.js"))
    
    Object.keys(entryFiles)
    .map((index) => {
        const entryFile = entryFiles[index]
        const match = entryFile.match(/src\(.*)\/index\.js/)
        const pageName = match && match[1]
        
        entryFile[pageName] = entryFile
        htmlWebpackPlugins.push(
             new HtmlWebpackPlugin({
                template: path.join(__dirname, `src/index.html`),
                filename: `${pageName}.html`,
                chunks: [pageName],
                inject: true,
                minify: {
                    html5: true,
                    collapseWhitespace: true,
                    preserveLineBreaks: false,
                    minifyCSS: true,
                    removeComments: false
                }
            })
        )
    })
    
    return {
        entry,
        htmlWebpackPlugins
    }
}

const { entry, htmlWebpackPlugins } = setMPA()

module.exports = {
    entry,
    plugins: [].concat(htmlWebpackPlugins)
}

```

### 使用 sourcemap

一般开发情况开启，线上环境关闭。线上排查问题的时候可以将 sourcemap 排查到错误监控系统。

关键字：

- eval：使用 eval 包裹代码块
- source map：产生 .map 文件
- cheap：不包含列信息
- inline：将 .map 作为 DataURL 嵌入，不单独生成 .map 文件
- module：包含 loader 的 sourcemap

```javascript
module.exports = {
    devtool: "source-map"
}
```

### 提取页面公共资源

这包括基础库的分离和公共脚本分离两个模块

基础库的分离

- 使用 html-webpack-externals-plugin，**将 react、react-dom 基础包通过 cdn 引入**，不打入 bundle 中

```javascript
plugins: [
    new HtmlWebpackExternalsPlugin({
        externals: [
            {
                module: "react",
                // cdn 引入
                entry: "",
                global: "React"
            },
            {
                module: "react-dom",
                entry: "",
                global: "ReactDOM"
            }
        ]
    })
]
```

- 或者使用 Webpack4 内置的。SplitChunksPlugin 进行基础库分离/公共脚本分离

```javascript
opimization: {
    // 默认参数
  splitChunks: {
    // async 异步引入的库进行分离
    // initial 同步引入的库进行分离
    // all 所以引入的库进行分离(推荐)
    chunks: "async",
    minSize: 30000,
    maxSize: 0,
    minChunks: 1,
    maxAsyncRequests: 5,
    maxInitialRequest: 3,
    automaticNameDelimiter: "~",
    name: true,
    cacheGroups: {
    vendors: {
      test: /[\\/]node_modules[\\/]/,
      priority: -10
    }
    }
  }，
    // // 匹配出需要分离的包
    splitChunks: {
        cacheGroups: {
            commons: {
                test: /(react|react-dom)/,
                name: "vendors",
                chunks: "all"
            }
        }
    },
    // 分离页面公共文件
    splitChunks: {
        miniSize: 0,
        cacheGroups: {
            commons: {
                name: "commons",
                chunks: all,
                // 设置最小引用次数
                minChunks: 2
            }
        }
    }
}
```

### Tree shaking

- 1 一个模块里面可能有多个方法，只要其中某个方法使用到了，则整个文件都会被打包到 bundle 里面去，tree shaking 就是只把用到的方法打到 bundle，没用的方法则会在 uglify 阶段被擦除掉

- 使用 webpack 默认支持，在 .babelrc 里设置 modules: false
- production mode 情况下默认开启
- 必须是 ES6 语法，CJS 的方式不支持，必须不能有副作用

ES6 模块的特点

- 只能作为模块顶层语句出现
- import 的模块名只能是字符串常量
- import binding 是 immutable 的

### ScopeHoisting

- 随着模块越来越多，打包出大量函数闭包包裹代码，导致体积增大
- 运行代码时创建的函数作用域变多，内存开销变大

scope hoisting 的原理（只支持 ES6，不支持 CMJ）

- 将所有模块的代码按照引用顺序放到一个函数作用域里，然后适当重命名一些变量以防止变量名冲突。
- 通过 scope hoisting 可以减少函数声明代码和内存开销

webpack4 开启 mode: production 默认支持，webpack3 需要 new webpack.optionmize.ModuleConcatenationPlugin()

### 代码分割和动态 import

对于大型 web 应用来讲，将所有的代码都放在一个文件中显然是不够有效的，特别是当你的某些代码块是在某些特殊的时候才会被用到。webpack 有一个功能就是将你的代码库分割成 chunks，当代码运行到需要它们的时候再进行加载。

适用场景

- 抽离相同代码到一个共享块
- 脚本懒加载，使初始下载的代码更小

懒加载 JS 脚本方式

- CommonJS：require.ensure
- ES6：动态 import（原生不支持，需要 babel 转换）

语法

```javascript
import("./test.js").then((Text) => {
    setState(Text)
})
```

### Webpack 结合 ESLint

制定团队的 ESLint 规范

- 不重复造轮子，基于 eslint: recommend 配置并改进
- 能够帮助发现代码错误的规则，全部开启
- 帮助保持团队的代码风格统一，而不是限制开发体验

ESLint 如何落地执行

- 和 CI/CD 系统集成
- 和 webpack 集成

CI/CD集成：本地开发阶段增加 precommit 钩子

- 安装 husky
- 增加 npm script，通过 lint-staged 增量检查修改的文件

```javascript
"script": {
    "precommit": "lint-staged"
},
"lint-staged": {
    "linters": {
        "*.{js,scss}": ["eslint --fix", "git add"]
    }
} 
```

防止 --no-modify，在 CI/CD 增加 lint pipline 是非常有必要的

Webpack 和 ESLint 集成

可以使用 eslint-config-airbnb 或 eslint-config-alloy 或 eslint-config-ivweb

- 这种方式只适合新项目，不适合一些老的项目的接入

```javascript
module.exports = {
  module: {
      rules: [
          {
              test: /\.js$/,
              exclude: /node_modules/,
              use: [
                  "babel-loader",
                  // 在构建时检查 JS 代码规范
                  "eslint-loader"
              ]
          }
      ]
  }
}
```

### webpack 如何打包库和组件

（rollup 更适合）

库

- 压缩版和非压缩版
- 支持 AMD/CJS/ESM 模块引入

库的结构目录

```diff
+ |-/dist
+  |-large-number.js
+  |=large-number.min.js
+ |-webpack.config.js
+ |-package.json
+ |-index.js
+ |-src
+  |-index.js
```

将库暴露出去

```javascript
module.export = {
    mode: "production",
    entry: {
        "large-number": "./src/index.js",
        "large-number.min": "./src/index.js"
    },
    output: {
        filename: "[name].js",
        library: "largeNumber",
        libraryExport: "default",
        libraryTarget: "umd"
    }
}
```

如何只对 .min 压缩

```javascript
module.exports = {
    mode: "none",
    entry: {
        "large-number": "./src/index.js",
        "large-number.min": "./src/index.js"
    },
    output: {
        filename: "[name].js",
        library: "largeNumber",
        libraryTarget: "umd"
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                include: /\.min\.js$/
            })
        ]
    }
}
```

设置打包入口：

```javascript
if (process.env.NODE_ENV = "production") {
    module.exports = require("./dist/large-number.min.js")
} else {
    module.exports = require("./dist/large-number.js")
}
```

### webpack 实现 SSR 打包

渲染 => HTML + CSS + JS + Data ---> 渲染后的 HTML；

服务端：

- 所有模板等资源都存储在服务端
- 内外机器拉取数据更快
- 一个 HTML 返回所有数据

服务端核心就是减少请求数、减少白屏时间，对 SEO 友好

代码实现思路：

服务端：

- 使用 react-dom/server 的 renderToString 方法将 React 组件渲染成字符串
- 服务端路由返回对应的模板

客户端：

- 打包出针对服务端的组件

```javascript
// webpack.ssr.js
module.exports = {
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name]-server.js",
        libraryTarget: "umd"
    }
}
```

```javascript
// server/index.js
if (typeof window === "undefined") {
  global.window = {}
}
const express = require("express")
const { renderToString } = require("react-dom/server")
const SSR = require("../dist/search-server")
const fs = require("fs")
const template = fs.readFileSync(path.join(__dirname, "../dist/search.html"), "utf-8")

const server = (port) => {
  const app = express()
  
  app.use(express.static("dist"))
    
  app.get("./search", (req, res) => {
      const html = renderMarkup(renderTpString(SSR))
      res.status(200).send(html)
  })
    
  app.listen(port, () => {
      console.log("Server is running on port:" + port)
  })
}

const renderMarkup = (str) => {
    const dataStr = JSON.stringify(data)
    // template 里面有 <!--INITIAL_DATA_PLACEHOLDER--> 和 <!--HTML_PLACEHOLDER-->
    return template.replace("<!--HTML_PLACEHOLDER-->", str).replate("<!--INITIAL_DATA_PLACEHOLDER-->", `<script>window.__initial=dataStr`)
}

server(process.env.PORT || 3000)
```

```javascript
// index-server.jsx
const React = require("react")
module.exports = Search;
```

webpack ssr 打包存在的问题：

浏览器的全局变量（Node 里面没有 document，window）

- 组件适配：将不兼容的组件根据打包进行适配
- 请求适配：将 fetch 或者 ajax 发送请求的写法改成 isomorphic-fetch 或者 axios

样式问题（Node 无法解析 CSS）：

- 法一：服务端打包通过 ignore-loader 忽略掉 CSS 的解析
- 法二：将 style-loader 替换成 isomorphic-style-loader

样式问题解决方案：

- 法一：使用打包出来的浏览器端 html 为模板，设置占位符，动态插入组件

### 优化命令行的显示日志

统计信息 stats

| Preset      | Alternative | Description                    |
| ----------- | ----------- | ------------------------------ |
| errors-only | none        | 只在发生错误时输出             |
| minimal     | none        | 只在发生错误或有新的编译时输出 |
| none        | false       | 没有输出                       |
| normal      | true        | 标准输出                       |
| verbose     | none        | 全部输出                       |

friendly-errors-webpack-plugin

```javascript
// webpack.config.js
module.exports = {
    stats: errors-only,
    plugins: [
        // success,warning,failure
        new FriendlyErrorsWebpackPlugin()
    ]
}
```

### 构建异常和中断处理

```javascript
plugins: [
    function() {
        // webpack4
        this.hooks.done.tap("done", (stats) => {
            if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf("--watch")==-1) {
                console.log("build error")
                process.exit(1)
            }
        })
    }
]
```

### 构建配置包设计

意义：通用性、可维护性、质量

- 业务开发者无需关注构建配置
- 统一团队构建成本
- 构建配置合理的拆分
- README、ChangeLog 文档等
- 冒烟测试、单元测试、测试覆盖率
- 持续集成

方案：

- 通过多个配置文件管理不同环境的构建：webpack.base|webpack.dev|webpack.prod|webpack.ssr。通过 webpack-merge 组合配置。merge = require("webpack-merge")
- 将构建配置设计成一个库，如：hjs-webpack、Neutrino、webpack-blocks。规范：Git commit 日志、README、ESLint 规范、Semver 规范。冒烟测试、单元测试、覆盖率测试和 CI。
- 抽出一个工具进行管理：如 create-react-app，kyt，nwb
- 将所有配置放在一个文件，通过 --env 参数控制分支选择

设计方案：

基础配置 webpack.base.js：

```javascript
// 资源解析：
解析 ES6
解析 React
解析 CSS
解析 Less
解析图片
解析字体

// 样式增强
CSS 前缀补齐
CSS px 换成 rem

// 目录清理
// 多页面打包
// 命令行信息显示优化
// 错误捕获与处理
// CSS 提取成一个单独的文件
```

开发阶段配置 webpack.dev.js：

```javascript
// 代码热更新
CSS 热更新
JS 热更新

// sourcemap
```

生产阶段配置 webpack.prod.js：

```javascript
// 代码压缩
// 文件指纹
// Tree Shaking
// Scope hoisting
// 速度优化：基础包 CND
// 体积优化：代码分割
```

服务端渲染配置 webpack.ssr.js：

```javascript
// output 的 libraryTarget 设置
// CSS 解析 ignore
```

### 使用 ESLint 规范构建脚本

- 使用 eslint-config-airbnb-base
- eslint --fix 可以自动处理空格

```javascript
// npm i exlint babel-eslint eslint-config-airbnb-base
// .eslintrc.js
module.exports = {
    "parser": "babel-eslint",
    "extends": "airbnb-base",
    "env": {
        "browser": true,
        "node": true
    }
}
```

### 冒烟测试

> 冒烟测试是指对提交测试的软件在进行详细深入的测试之前而进行的预测试，这种预测试的主要目的是暴露导致软件需重新发布的基本功能失效等严重的问题。

- 构建是否成功
- 每次构建完成 build 目录是否有目录输出
- 是否有 js、css 等静态资源文件
- 是否有 html 文件

通过工具执行 webpack

```javascript
const path = require("path")
const webpack = require("webpack")
const rimraf = require("rimraf")
const Mocha = require("mocha")

const mocha = new Mocha({
    timeout: "10000ms"
})

process.chdir(__dirname)

rimraf("./dist", () => {
    const prodConfig = require("../../lib/webpack.prod")
    webpack(prodConfig, (err, stats) => {
        if (err) {
            console.err(err)
            return
        }
        
        console.log(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }))
        
        console.log("\n" + "Compiler success, begin")
    })
})
```

判断基本功能是否正常

- 是否有 JS、CSS、HTML 等

编写 mocha 测试用例

```javascript
const glob = require("glob-all")

describe("checking generated file exists", function () {
    it ("should generate html files", function (done) {
        const files = glob.sync([
            "./dist/index.html",
            "./dist/search.html"
        ])
        
        if (files.length > 0) {
            done()
        } else {
            throw new Error("no html files found")
        }
    })
    
    
    it ("should generate js & css files", function () {
        const files = glob.sync([
            "./dist/index_*.js",
            "./dist/search_*.js",
            ".dist/index_*.css",
            "./dist/search_*.css"
        ])
        
        if (files.length > 0) {
            done()
        } else {
            throw new Error("No files found")
        }
    })
})
```

### 单元测试和测试覆盖率

mocha + chai

### 持续集成（CI）

- 快速发现错误
- 防止分支大幅度偏离主干

核心措施是，代码集成到主干之前，必须通过自动化测试。只要有一个测试用例失败，就不能集成。

接入 Travis CI：

- 在 https://travis-ci.org/ 使用 github 登陆
- 在 https://travis-ci.org/account/repositories 为项目开启
- 在项目根目录下新增 .travis.yml

### git commit 规范和 change log 的生成

- 加快 Code Review 的流程
- 根据 Git Commit 的元数据生成 Changelog
- 后续维护者可以知道 Feature 被修改的原因

```javascript
统一团队 Git commit 日志标准，便于后续代码 review 和版本发布
使用 angular 的 Git commot 日志作为基本规范：提交类型限制为：feat、fix（bug）、docs、style、refactor（重构）、pref（性能优化）、test、chore（构建）、revert（回滚） 等
提交信息分为两部分，标题（首字母不大写，末尾不要标点）、主体内容（正常的描述信息即可）
日志提交时友好的类型选择提示：使用 commitize 工具
不符合哟啊求格式的日志拒绝提交的保障机制：使用 validate-comit-msg 工具、需同时在客户端、gitlab server hook 做
统一 changelog 文档信息生成：使用 conventional-changelog-cli 工具
```

本地开发阶段增加 precommit 钩子：

```javascript
// 安装 husky
// npm install husky -S

"script": {
    "commitmsg": "validate-commmit-msg",
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s -r 0"
}

"devDependencies": {
    "validate-commit-msg": "^2.11.1",
    "conventional-changelog-cli": "^1.2.0",
    "husky": "^0.13.1"
}
```

### semver 版本规范

X.Y.Z。版本是严格递增的

- 主版本号：当你做了不兼容 API 的修改
- 次版本号：当你做了向下兼容的功能性新增
- 修订号：当你做了向下兼容的问题修正

在发行重要版本时，可以先发布 alpha、beta、rc 等先行版本。

- 避免出现循环依赖
- 依赖冲突减少

- alpha：是内部测试版，一般不向外发布，会有很多 bug，一般只有测试人员使用
- beta：也是测试版，这个版本会一直加入新的功能。在 alpha 版本之后推出
- rc：候选版本。系统平台上就是发行候选版本。RC 版不会再加入新的功能了，主要着重于除错

### 使用 webpack 内置的 stats

stats：统计构建的信息，如构建时间和体积大小

```json
"script": {
    "build:stats": "webpack --env production --jso/n > stats.json"
}
```

### speed-measure-webpack-plugin

- 可以看到每个 loader 和插件执行耗时
- 整个打包系统耗时

### webpack-bundle-analyzer 分析体积

- 分析依赖的第三方模块文件大小
- 业务组件代码大小

### 使用高版本的 webpack 和 nodejs

webpack 或者 nodejs 每升级一个版本就会带来 50% 左右的速度收益

### 多进程多实例构建

可选方案：

- thread-loader：和 happypack 是一样的。是官方推出的。
- parallel-webpack
- happyPack：每次 webpack 解析一个模块，happyPack 会将它以及它的依赖分配给 worker 线程中

### 多进程多实例并行压缩

可选方案：

- parallel-uglify-plugin
- uglifyjs-webpack-plugin 开启 parallel 参数：不支持 ES6 语法
- terser-webpack-plugin 开启 parallel 参数（推荐）

### 进一步分包：预编译资源模块

react、react-dom、redux 等等使用 cdn 会打出很多 script 标签，不好。

使用 DLLPlugin 进行分包，DllReferencePlugin 对 manifest.json 引用，这样就可以库集成到一个基础包

### 利用缓存提升二次构建速度

方案：

- babel-loader 开启缓存
- terser-webpack-loader 开启缓存（webpack4 推荐）
- 使用 cache-loader 或者 hard-source-webpack-plugin

### 缩小构建目标提升构建速度

目的：尽可能少的构建模块，如 babel-loader 不解析 node_modules

减少文件搜索范围：

- 优化 resolve.modules 配置：modules: [path.resolve(__dirname, "node_modules")]
- 优化 resolve.mainFields 配置：根据第三方组件的 package.josn 的main去找：mainFields: ["main"]
- 优化 resolve.extensions 配置：只寻找 extensions: [".js"]
- 合理使用 alias：aliae: { react: path.resolve(__dirname, "./node_modules/react/dist/react.min.js") }，告知 webpack 直接定位不用寻找

### 使用 webpack 进行图片压缩（非常重要）

要求：基于 Node 库的 imagemin 或者 tinypng API

使用：配置 image-webpack-loader

```javascript
test: /\.(png)$/,
    use: [
            {
                loader: "file-loader",
                options: {
                    name: ``
                }
            },
            {
                loader: "image-webpack-loader",
                options: {
                    mozjeg: {
                        progressive: true,
                        quality: 65
                    }
                    ......
                }
            }
         ]
```

Imagemin 优点分析

- 有很多定制选项
- 可以引入更多第三方优化插件，例如 pngquant
- 可以处理多种图片格式

### 使用 Tree Shaking 擦除无用的 CSS

js production 环境默认 Tree Shaking

方案：

- PurifyCSS：遍历代码，识别已经用到的 CSS class
- uncss：HTML 需要通过 jsdom 加载，所有的样式通过 PostCSS 解析，通过 document.querySelector 来识别在 html 文件里面不存在的选择器

### 动态 Polyfill

问题：babel-polyfill 打包体积过大

| 方案                           | 优点                                  | 缺点                                                         | 是否采用 |
| ------------------------------ | ------------------------------------- | ------------------------------------------------------------ | -------- |
| babel-polfill                  |                                       |                                                              | X        |
| babel-plugin-transform-runtime |                                       |                                                              | X        |
| 自己写 map 和 set 的polyfill   |                                       |                                                              | X        |
| polyfill-serveice              | 只给用户返回需要的 polyfill，社区维护 | 部分国内奇葩浏览器 UA 可能无法识别（但可以降级返回所需全部 APi） | 是       |

polyfill 原理：识别 User Agent，下发不同的 Polyfill

使用：

script src="https://cdn.polyfill.io/v2/polyfill.min.js"

也可以基于官方自建 polyfill 服务

### webpack 启动过程分析

运行：

- 通过 npm scripts 运行
- 通过 webpack 直接运行：webpack entry.js bundle.js

查找 webpack 入口文件：

npm 会让命令行工具去 node_modules\ .bin 目录查找是否存在 webpack.sh 或者 webpack.cmd 文件。存在则执行，不存在则抛错。（局部安装会创建上述文件。实际的入口文件是 node_modules\webpack\bin\webpack.js）

webpack.js 干了什么？

```javascript
// 正常执行 exitcode
// 运行某个命令
// 判断某个包是否安装
// webpack 可用的 cli
// 判断两个 cli 是否安装了
// 根据安装数量进行处理
```

### webpack-cli 源码简析

webpack-cli 做了哪些事情：

- 引入 yargs，对命令行进行定制
- 分析命令行参数，对各个参数进行转换，组成编译配置项
- 引用 webpack，根据配置项进行编译和构建

这块太 sick 了。不看了。。。。

### Tapable 插件架构与 Hooks 设计

Tapable 是一个类似于 Node.js 的 EventEmitter 的库，主要是控制钩子函数的发布与订阅，控制着 webpack 的插件系统。webpack 继承了 Tapable 类

Tabable 暴露了很多 Hook 钩子（类），为插件提供挂载的钩子。四个同步钩子，五个异步的钩子。

也很 sick 不看了。。。。。。。

### Tapable 是如何与 webpack 关联起来的

sick 。。。

### webpack 流程：准备阶段

钩子调用顺序

```txt
entry-option: 初始化 option
run：开始编译
make：从 entry 开始递归分析依赖，对每个依赖模块进行 build
before-resolve：对模块位置进行解析
build-module：开始构建某个模块
normal-module-loader：将 loader 加载完成的 module 进行编译，生成 AST 树
program：遍历 AST 树，当遇到 require 等一些调用表达式的时候，收集依赖
seal：所有依赖 build 完成，开始优化
emit：输出到 dist 目录
```

### webpack 流程：构建模块和 chunk 生成阶段

### webpack 流程：文件生成
