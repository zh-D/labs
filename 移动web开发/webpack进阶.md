### 实现简易的 webpack

可以将 ES6 语法转换成 ES5 语法

- 通过 babylon 生成 AST
- 通过 bable-core 将 AST 重新生成源码

可以分析模块之间的依赖关系

- 通过 babel-traverse 的 ImportDeclaration 方法获取依赖属性

生成的 JS 文件可以在浏览器中运行

```json
// package.json
{
  "name": "simplepack",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@babel/preset-env": "^7.16.11",
    "babel-core": "^6.26.3",
    "babel-traverse": "^6.26.0",
    "babylon": "^6.18.0"
  },
  "devDependencies": {
    "babel-preset-env": "^1.7.0"
  }
}

```

```javascript
// .babelrc
{
    "presets": [
        "@babel/preset-env"
    ]
}
```

```javascript
// simplepack.config.js
const path = require("path")

module.exports = {
    entry: path.join(__dirname, "src/index.js"),
    output: {
        path: path.join(__dirname, "./dist"),
        filename: "main.js"
    }
}

```

```javascript
// src/index.js
import { greeting } from "./greeting.js";

document.write(greeting("simplepack"))

// src/greeting.js
export function greeting (name) {
   return "hello" + name 
}
```

```javascript
// lib/index
const Compiler = require("./compiler")
const options = require("../simplepack.config")

new Compiler(options).run()
```

```javascript
// lib/compiler
const { getAST, getDependencies, transform } = require("./parser")
const path = require("path")
const fs = require("fs")

module.exports = class Compiler {
    constructor(options) {
        const { entry, output } = options
        this.entry = entry
        this.output = output
        this.modules = []
    }

    run() {
        // { filename, dependencies, source }
        const entryModule = this.buildModule(this.entry, true)

        this.modules.push(entryModule)

        this.modules.map((_module) => {
            _module.dependencies.map((dependency) => {
                this.modules.push(this.buildModule(dependency))
            })
        })

        // console.log(this.modules);
        this.emitFiles()
    }

    buildModule(filename, isEntry) {
        let ast
        if (isEntry) {
            ast = getAST(filename)
        } else {
            const absolutePath = path.join(process.cwd(), "./src", filename)
            ast = getAST(absolutePath)
        }

        return {
            filename,
            dependencies: getDependencies(ast),
            source: transform(ast)
        }
    }

    emitFiles() {
        const outputPath = path.join(this.output.path, this.output.filename)

        let modules = ""

        this.modules.map((_module) => {
            modules += `'${_module.filename}': function (require, module, exports) { ${_module.source} },`
        })

        const bundle = `(function(modules) {
            function require(filename) {
                var fn = modules[filename]
                var module = { exports: {} }

                fn(require, module, module.exports)

                return module.exports
            }

            require("${this.entry}")
        })({${modules}})`

        fs.writeFileSync(outputPath, bundle, "utf-8")
    }
}
```

```javascript
// lib/parser
//  转换成 ast
const babylon = require("babylon")
const fs = require("fs")
const traverse = require("babel-traverse").default
const { transformFromAst } = require("babel-core")


module.exports = {
    getAST: (path) => {
        const source = fs.readFileSync(path, "utf-8")

        return babylon.parse(source, {
            sourceType: "module"
        })
    },
    getDependencies: (ast) => {
        const dependencies = []
        traverse(ast, {
            ImportDeclaration: ({ node }) => {
                dependencies.push(node.source.value)
            }
        })

        return dependencies
    },
    transform: (ast) => {
        const { code } = transformFromAst(ast, null, {
            presets: ["env"]
        })

        return code
    }
}
```

### loader 的链式调用与执行顺序

定义：loader 只是一个导出为函数的 JavaScript 模块

```javascript
module.exports = function(source) {
    // your opration
    return source
}
```

多 loader 是串行执行的，顺序从后到前

函数组合的两种情况：

- Unix 中的 pipline（总左往右）
- Compose（webpack 采取的是这种从右往左）

```javascript
// loader1
module.exports = function(source) {
    // your opration
    console.log("loader1 was executed")
    return source
}
```

```javascript
// loader2
module.exports = function(source) {
    // your opration
    console.log("loader2 was executed")
    return source
}
```

### 使用 loader-runner 进行 loader 调试

loader-runner 可以在你不安装 webpack 的情况下运行 loaders

- 作为 webpack 依赖，webpack 中使用它执行 laoder
- 进行 loader 的开发和调试

### 开发一个 raw-loader

### 复杂的 loader

通过 loader-utils 的 getOptions 方法获取 option：

```javascript
const loaderUtils = require("loader-utils")

module.exports = function(content) {
    const { name } = loaderUtils.getOptions(this)
}
```

loader 的异常处理：

- loader 内直接通过 throw 抛出
- 通过 this.callback 传递错误

```javascript
this.callback(
    err: Error | null,
    content: string | Buffer,
    sourceMap?: SourceMap,
    meta?: any
)
```

异步的 loader：

- 通过 this.async() 得到 callback

在 loader 中使用缓存：

webpack 中默认开启 laoder 缓存

- 可以使用 this.cacheable(false) 关掉缓存

缓存条件：loader 的结果在相同的输入下有确定的输出

- 有依赖的 loader 无法使用缓存

loader 如何进行文件输出

- 通过 this.emitFile 进行文件写入

### 开发一个自动合成雪碧图的 loader

```json
// package.json
{
  "name": "sprite-loader",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "loader-runner": "^4.2.0",
    "spritesmith": "^3.4.0"
  }
}

```

```javascript
// run-loader.js
const fs = require("fs")
const path = require("path")
const { runLoaders } = require("loader-runner")

runLoaders(
    {
        resource: "./loaders/index.css",
        loaders: [path.resolve(__dirname, "./loaders/sprite-loader")],
        readResource: fs.readFile.bind(fs)
    },
    (err, result) => {
        err ? console.log(err) : null;
    }
)
```

```javascript
// sprite-loader
const fs = require("fs")
const path = require("path")
const Spritesmith = require("spritesmith")

module.exports = function (source) {
    const callback = this.async()

    const imgs = source.match(/url\((\S*)\?__sprite/g)

    console.log("imgs", imgs);
    const matchedImgs = []

    for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i].match(/url\((\S*)\?__sprite/)[1]
        console.log("-----------------------------------");
        console.log(imgs[i].match(/url\((\S*)\?__sprite/));
        // console.log(path.join(__dirname, img));
        matchedImgs.push(path.join(__dirname, img))
        // console.log("img", matchedImgs);
    }



    Spritesmith.run({
        src: matchedImgs
    }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            // 实际使用的是 emit，loader-runner 里面没有所以用这个代替
            fs.writeFileSync(path.join(process.cwd(), "dist/sprite.jpg"), result.image)
            source = source.replace(/url\((\S*)\?__sprite/g, (match) => {
                return `url("dist/sprite.jpg")`
            })
            fs.writeFileSync(path.join(process.cwd(), "dist/index.css"), source)
            console.log()
            callback(null, source)
        }

    })

}
```

### webpack 插件基本结构

插件没有像 loader 那样的独立运行的环境，只能在 webpack 里面运行

插件的基本结构

```javascript
class MyPlugin {
    apply(compiler) {
        compiler.hooks.done.tap("My Plugin", (stats/** stats is passed as argument when done hook is tapped */) => {
            console.log("Hello World");
        })
    }
}
```

插件的传参

```javascript
class MyPlugin {
    constructor(options) {
        this.options = options
    }
}
```

错误处理：

- 参数校验阶段可以直接 throw 的方式抛出：throw new Error("Error Message")
- 通过 compilation 对象的 warning 和 errors 接收：compilation.warnings.push("warning")、compilation.errors.push("error")

通过 Compilation 进行文件写入：

Compilation 上的 assets 可以用于文件写入：可以将 zip 资源包设置到 compilatioin.assets 对象上

文件写入需要用到 webpack-sources

```javascript
const {RawSource} = require("webpack-sources")
module.exports = class Myplugin {
    constructor(options) {
        this.options = options
    }

    apply(compiler) {
        console.log("My plugin is executed", this.options)
        compiler.plugin("emit", (compilation, cb) => {
            compilation.assets[name] = new RawSource("demo")
            cb()
        })
    }
}/
```

插件扩展：

插件自身也可以暴露 hooks 来进行自身扩展，html-webpack-plugin 为例

- html-webpack-plugin-alter-chunks(Sync)
- html-webpack-plugin-before-html-generation(Async)
- html-webpack-plugin-alter-asset-tags(Async)
- html-webpack-plugin-after-html-processing(Async)
- html-webpack-plugin-after-emit(Async)

### 开发一个压缩构建资源为 zip 包的插件

要求：

- 生成的 zip 包文件名称可以通过插件传入
- 需要使用 compiler 对象上的特定 hooks 进行资源的生成

思路：

- 通过 JSZip npm 包来压缩
- 通过 Compiler 上的相关 hook 来生成文件

```javascript
// package.json
{
  "name": "webpack-plugin-zip",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "jszip": "^3.7.1",
    "loader-utils": "^2.0.0",
    "webpack": "^4.15.1",
    "webpack-cli": "^3.3.11"
  }
}

```

```javascript
// webpack.config.js
const path = require("path")
const ZipPlugin = require("./plugins/zip-plugin")

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, "dist"),
        filename: "main.js"
    },
    mode: "production",
    plugins: [
        new ZipPlugin({
            filename: "offline"
        })
    ]
}
```

```javascript
// plugins/zip-plugin
const { RawSource } = require("webpack-sources")
const JSZip = require("jszip")
const path = require("path")
const zip = new JSZip()

module.exports = class ZipPlugin {
    constructor(options) {
        this.options = options
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync("ZipPlugin", (compilation, cb) => {
            const folder = zip.folder(this.options.filename)

            for (let filename in compilation.assets) {
                const source = compilation.assets[filename].source()
                folder.file(filename, source)
                console.log(source);
            }
            zip.generateAsync({
                type: "nodebuffer"
            }).then((content) => {
                console.log(content);
                const outputPath = path.join(compilation.options.output.path, this.options.filename + ".zip")
                const outputRelativePath = path.relative(
                    compilation.options.output.path,
                    outputPath
                )
                compilation.assets[outputRelativePath] = new RawSource(content)
                cb()
            })
        })
    }
}
```
