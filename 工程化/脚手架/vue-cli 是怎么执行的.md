下载 vue-cli 这个包，在 packages/@vue/cli 里，从 package.json 的 bin 字段，我们找到了 bin/vue.js，如果执行 vue 命令，就是执行这个 js 文件。

#### cli/vue.js

首先检查 node 版本：

```javascript
function checkNodeVersion (wanted, id) {
  if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {
    console.log(chalk.red(
      'You are using Node ' + process.version + ', but this version of ' + id +
      ' requires Node ' + wanted + '.\nPlease upgrade your Node version.'
    ))
    process.exit(1)
  }
}

checkNodeVersion(requiredVersion, '@vue/cli')
```


enter debug mode when creating test repo
```javascript
// enter debug mode when creating test repo
if (
  slash(process.cwd()).indexOf('/packages/test') > 0 && (
    fs.existsSync(path.resolve(process.cwd(), '../@vue')) ||
    fs.existsSync(path.resolve(process.cwd(), '../../@vue'))
  )
) {
  process.env.VUE_CLI_DEBUG = true
}

```

就是说在 packages/test 下的命令会进入 debug mode

接下来从 71 到 198 行是注册命令

从 218 开始到 223 行错误处理

```javascript

// enhance common error messages
const enhanceErrorMessages = require('../lib/util/enhanceErrorMessages')

enhanceErrorMessages('missingArgument', argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', optionName => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return `Missing required argument for option ${chalk.yellow(option.flags)}` + (
    flag ? `, got ${chalk.yellow(flag)}` : ``
  )
})

```

到此为止 vue.js 结束。

#### vue create 命令

上面说，从 71 到 198 行是注册命令

与 create 相关的代码如下：

```javascript
program
  .command('create <app-name>')
  .description('create a new project powered by vue-cli-service')
  .option('-p, --preset <presetName>', 'Skip prompts and use saved or remote preset')
  .option('-d, --default', 'Skip prompts and use default preset')
  .option('-i, --inlinePreset <json>', 'Skip prompts and use inline JSON string as preset')
  .option('-m, --packageManager <command>', 'Use specified npm client when installing dependencies')
  .option('-r, --registry <url>', 'Use specified npm registry when installing dependencies (only for npm)')
  .option('-g, --git [message]', 'Force git initialization with initial commit message')
  .option('-n, --no-git', 'Skip git initialization')
  .option('-f, --force', 'Overwrite target directory if it exists')
  .option('--merge', 'Merge target directory if it exists')
  .option('-c, --clone', 'Use git clone when fetching remote preset')
  .option('-x, --proxy <proxyUrl>', 'Use specified proxy when creating project')
  .option('-b, --bare', 'Scaffold project without beginner instructions')
  .option('--skipGetStarted', 'Skip displaying "Get started" instructions')
  .action((name, options) => {
    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(chalk.yellow('\n Info: You provided more than one argument. The first one will be used as the app\'s name, the rest are ignored.'))
    }
    // --git makes commander to default git to true
    if (process.argv.includes('-g') || process.argv.includes('--git')) {
      options.forceGit = true
    }
    require('../lib/create')(name, options)
  })
```
可以看到除了注册了这么多选项之外，最主要是运行 lib/create.js

create 一共才 60 多行代码。

首先进来时，判断有没有 -x 参数，开启 proxy

```javascript
  if (options.proxy) {
    process.env.HTTP_PROXY = options.proxy
  }
```

检查项目名称是否合法：

```javascript
  const result = validateProjectName(name)
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`))
    result.errors && result.errors.forEach(err => {
      console.error(chalk.red.dim('Error: ' + err))
    })
    result.warnings && result.warnings.forEach(warn => {
      console.error(chalk.red.dim('Warning: ' + warn))
    })
    exit(1)
  }
```

如果已经存在同名文件，提示是否覆盖

```javascript
  if (fs.existsSync(targetDir) && !options.merge) {
    if (options.force) {
      await fs.remove(targetDir)
    } else {
      await clearConsole()
      if (inCurrent) {
        const { ok } = await inquirer.prompt([
          {
            name: 'ok',
            type: 'confirm',
            message: `Generate project in current directory?`
          }
        ])
        if (!ok) {
          return
        }
      } else {
        const { action } = await inquirer.prompt([
          {
            name: 'action',
            type: 'list',
            message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
            choices: [
              { name: 'Overwrite', value: 'overwrite' },
              { name: 'Merge', value: 'merge' },
              { name: 'Cancel', value: false }
            ]
          }
        ])
        if (!action) {
          return
        } else if (action === 'overwrite') {
          console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
          await fs.remove(targetDir)
        }
      }
    }
  }
```

创建 creator 对象并调用它的 create 方法。

#### creator 对象和它的 create 方法

creator 对象有 500 行代码，难以展开了。

看一下它的 constructor

```javascript
constructor (name, context, promptModules) {
    super()

    this.name = name
    this.context = process.env.VUE_CLI_CONTEXT = context
    const { presetPrompt, featurePrompt } = this.resolveIntroPrompts()

    this.presetPrompt = presetPrompt
    this.featurePrompt = featurePrompt
    this.outroPrompts = this.resolveOutroPrompts()
    this.injectedPrompts = []
    this.promptCompleteCbs = []
    this.afterInvokeCbs = []
    this.afterAnyInvokeCbs = []

    this.run = this.run.bind(this)

    const promptAPI = new PromptModuleAPI(this)
    promptModules.forEach(m => m(promptAPI))
    }
```

看一下它的 create 方法，也有 200 行，我们来分析下：

检查有没有 -p、-d、-i 选项，进行相应的逻辑处理
```javascript
    if (!preset) {
      if (cliOptions.preset) {
        // vue create foo --preset bar
        preset = await this.resolvePreset(cliOptions.preset, cliOptions.clone)
      } else if (cliOptions.default) {
        // vue create foo --default
        preset = defaults.presets.default
      } else if (cliOptions.inlinePreset) {
        // vue create foo --inlinePreset {...}
        try {
          preset = JSON.parse(cliOptions.inlinePreset)
        } catch (e) {
          error(`CLI inline preset is not valid JSON: ${cliOptions.inlinePreset}`)
          exit(1)
        }
      } else {
        preset = await this.promptAndResolvePreset()
      }
    }

```
一般还是不传，走 else 的逻辑，所以看一下 promptAndResolvePreset

```javascript
    // prompt
    if (!answers) {
      await clearConsole(true)
      answers = await inquirer.prompt(this.resolveFinalPrompts())
    }
```

看一下 resolveFinalPrompts

```javascript
    this.injectedPrompts.forEach(prompt => {
      const originalWhen = prompt.when || (() => true)
      prompt.when = answers => {
        return isManualMode(answers) && originalWhen(answers)
      }
    })
```

然后 return 了一个 prompts

```javascript
    const prompts = [
      this.presetPrompt,
      this.featurePrompt,
      ...this.injectedPrompts,
      ...this.outroPrompts
    ]
    debug('vue-cli:prompts')(prompts)
    return prompts
```

回到 `answers = await inquirer.prompt(this.resolveFinalPrompts())`，这里让你选择 vue2 还是 vue3 模板

接下来是

```javascript
if (answers.packageManager) {
    saveOptions({
    packageManager: answers.packageManager
    })
}
```
后面的全部代码都是操作 preset。它包括

```javascript
{vueVersion: '2', useConfigFiles: false, cssPreprocessor: undefined, 
plugins:{@vue/cli-plugin-babel:{}, @vue/cli-plugin-eslint:{config: 'base', lintOn: ['save']}}}
```

回到 create 的逻辑

先 deepclone

```javascript
preset = cloneDeep(preset)
```

注入核心服务

```javascript
// inject core service
preset.plugins['@vue/cli-service'] = Object.assign({
    projectName: name
}, preset)
```

下面的插件都没有

```javascript
if (cliOptions.bare) {
    preset.plugins['@vue/cli-service'].bare = true
}

// legacy support for router
if (preset.router) {
    preset.plugins['@vue/cli-plugin-router'] = {}

    if (preset.routerHistoryMode) {
    preset.plugins['@vue/cli-plugin-router'].historyMode = true
    }
}

// legacy support for vuex
if (preset.vuex) {
    preset.plugins['@vue/cli-plugin-vuex'] = {}
}
```

触发 creation 事件

```javascript
this.emit('creation', { event: 'creating' })
```

注释说得很清楚了

```javascript
    // get latest CLI plugin version
    const { latestMinor } = await getVersions()

    // generate package.json with plugin dependencies
    const pkg = {
      name,
      version: '0.1.0',
      private: true,
      devDependencies: {},
      ...resolvePkg(context)
    }
    const deps = Object.keys(preset.plugins)
    deps.forEach(dep => {
      if (preset.plugins[dep]._isPreset) {
        return
      }

      let { version } = preset.plugins[dep]

      if (!version) {
        if (isOfficialPlugin(dep) || dep === '@vue/cli-service' || dep === '@vue/babel-preset-env') {
          version = isTestOrDebug ? `latest` : `~${latestMinor}`
        } else {
          version = 'latest'
        }
      }

      pkg.devDependencies[dep] = version
    })
```

```javascript
// write package.json
await writeFileTree(context, {
    'package.json': JSON.stringify(pkg, null, 2)
})
```

现在我们可以看到生成了一个这样的 package.json

```javascript
{
  "name": "asdc",
  "version": "0.1.0",
  "private": true,
  "devDependencies": {
    "@vue/cli-plugin-babel": "~5.0.0-beta.2",
    "@vue/cli-plugin-eslint": "~5.0.0-beta.2",
    "@vue/cli-service": "~5.0.0-beta.2"
  }
}
```

接下来是 initGit

```javascript
    // intilaize git repository before installing deps
    // so that vue-cli-service can setup git hooks.
    const shouldInitGit = this.shouldInitGit(cliOptions)
    if (shouldInitGit) {
      log(`🗃  Initializing git repository...`)
      this.emit('creation', { event: 'git-init' })
      await run('git init')
    }

```

接下来是 install plugin

```javascript
    // install plugins
    log(`⚙\u{fe0f}  Installing CLI plugins. This might take a while...`)
    log()
    this.emit('creation', { event: 'plugins-install' })

    if (isTestOrDebug && !process.env.VUE_CLI_TEST_DO_INSTALL_PLUGIN) {
      // in development, avoid installation process
      await require('./util/setupDevProject')(context)
    } else {
      await pm.install()
    }

```
在这里 pm.install() 就相当于使用 npm install 安装上面 package.json 里面的内容

接下来是 run generator

```javascript
    log(`🚀  Invoking generators...`)
    this.emit('creation', { event: 'invoking-generators' })
    const plugins = await this.resolvePlugins(preset.plugins, pkg)
    const generator = new Generator(context, {
      pkg,
      plugins,
      afterInvokeCbs,
      afterAnyInvokeCbs
    })
    await generator.generate({
      extractConfigFiles: preset.useConfigFiles
    })

```

这里就 生成了一个 generator 对象并调用了它的 generate 方法，生成了 .ignore、bable.config.js、jsconfig.json、以及 src 目录。

package.json 变成这样了

```javascript
{
  "name": "asdc",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "lint": "vue-cli-service lint"
  },
  "dependencies": {
    "core-js": "^3.8.3",
    "vue": "^2.6.11"
  },
  "devDependencies": {
    "@babel/core": "^7.12.16",
    "@babel/eslint-parser": "^7.12.16",
    "@vue/cli-plugin-babel": "~5.0.0-beta.2",
    "@vue/cli-plugin-eslint": "~5.0.0-beta.2",
    "@vue/cli-service": "~5.0.0-beta.2",
    "eslint": "^7.20.0",
    "eslint-plugin-vue": "^7.6.0",
    "vue-template-compiler": "^2.6.11"
  },
  "eslintConfig": {
    "root": true,
    "env": {
      "node": true
    },
    "extends": [
      "plugin:vue/essential",
      "eslint:recommended"
    ],
    "parserOptions": {
      "parser": "@babel/eslint-parser"
    },
    "rules": {}
  },
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
}

```

我们发现 plugin 的依赖不见了，接下来再次安装依赖

```javascript
// install additional deps (injected by generators)
log(`📦  Installing additional dependencies...`)
this.emit('creation', { event: 'deps-install' })
log()
if (!isTestOrDebug || process.env.VUE_CLI_TEST_DO_INSTALL_PLUGIN) {
    await pm.install()
}
```

run complete cbs if any (injected by generators)

```javascript
    // run complete cbs if any (injected by generators)
    log(`⚓  Running completion hooks...`)
    this.emit('creation', { event: 'completion-hooks' })
    for (const cb of afterInvokeCbs) {
      await cb()
    }
    for (const cb of afterAnyInvokeCbs) {
      await cb()
    }

    // 生成 README
    if (!generator.files['README.md']) {
      // generate README.md
      log()
      log('📄  Generating README.md...')
      await writeFileTree(context, {
        'README.md': generateReadme(generator.pkg, packageManager)
      })
    }

```

commit initial state

```javascript
// commit initial state
let gitCommitFailed = false
if (shouldInitGit) {
    await run('git add -A')
    if (isTestOrDebug) {
    await run('git', ['config', 'user.name', 'test'])
    await run('git', ['config', 'user.email', 'test@test.com'])
    await run('git', ['config', 'commit.gpgSign', 'false'])
    }
    const msg = typeof cliOptions.git === 'string' ? cliOptions.git : 'init'
    try {
    await run('git', ['commit', '-m', msg, '--no-verify'])
    } catch (e) {
    gitCommitFailed = true
    }
}
```

最后我们看一下 generator 是如何生成代码的。

```javascript
  async generate ({
    extractConfigFiles = false,
    checkExisting = false
  } = {}) {
    await this.initPlugins()

    // save the file system before applying plugin for comparison
    const initialFiles = Object.assign({}, this.files)
    // extract configs from package.json into dedicated files.
    this.extractConfigFiles(extractConfigFiles, checkExisting)
    // wait for file resolve
    await this.resolveFiles()
    // set package.json
    this.sortPkg()
    this.files['package.json'] = JSON.stringify(this.pkg, null, 2) + '\n'
    // write/update file tree to disk
    await writeFileTree(this.context, this.files, initialFiles, this.filesModifyRecord)
  }

```

最重要的代码是这一句，`await this.resolveFiles()`，它会生成 this.files

本来 this.files 是这样的

```javascript
{babel.config.js: 'module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ]
}
'}

```

经过 resolveFiles 里的这段代码


```javascript
for (const middleware of this.fileMiddlewares) {
    await middleware(files, ejs.render)
}
```
就变成了好多

```javascript
{
  "babel.config.js": "module.exports = {\n  presets: [\n    '@vue/cli-plugin-babel/preset'\n  ]\n}\n",
  "jsconfig.json": "{\n  \"compilerOptions\": {\n    \"target\": \"es5\",\n    \"module\": \"esnext\",\n    \"baseUrl\": \"./\",\n    \"moduleResolution\": \"node\",\n    \"paths\": {\n      \"@/*\": [\n        \"src/*\"\n      ]\n    },\n    \"lib\": [\n      \"esnext\",\n      \"dom\",\n      \"dom.iterable\",\n      \"scripthost\"\n    ]\n  }\n}\n",
  ".gitignore": ".DS_Store\nnode_modules\n/dist\n\n\n# local env files\n.env.local\n.env.*.local\n\n# Log files\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\npnpm-debug.log*\n\n# Editor directories and files\n.idea\n.vscode\n*.suo\n*.ntvs*\n*.njsproj\n*.sln\n*.sw?\n",
  "public/favicon.ico": {
    "0": 0,
    "1": 0,
    "2": 1,
    "3": 0,
    ......
    "6846": 66,
    "6847": 96,
    "6848": 130,
  },
  "src/components/HelloWorld.vue": "<template>\n  <div class=\"hello\">\n    <h1>{{ msg }}</h1>\n    <p>\n      For a guide and recipes on how to configure / customize this project,<br>\n      check out the\n      <a href=\"https://cli.vuejs.org\" target=\"_blank\" rel=\"noopener\">vue-cli documentation</a>.\n    </p>\n    <h3>Installed CLI Plugins</h3>\n    <ul>\n      <li><a href=\"https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel\" target=\"_blank\" rel=\"noopener\">babel</a></li>\n      <li><a href=\"https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint\" target=\"_blank\" rel=\"noopener\">eslint</a></li>\n    </ul>\n    <h3>Essential Links</h3>\n    <ul>\n      <li><a href=\"https://vuejs.org\" target=\"_blank\" rel=\"noopener\">Core Docs</a></li>\n      <li><a href=\"https://forum.vuejs.org\" target=\"_blank\" rel=\"noopener\">Forum</a></li>\n      <li><a href=\"https://chat.vuejs.org\" target=\"_blank\" rel=\"noopener\">Community Chat</a></li>\n      <li><a href=\"https://twitter.com/vuejs\" target=\"_blank\" rel=\"noopener\">Twitter</a></li>\n      <li><a href=\"https://news.vuejs.org\" target=\"_blank\" rel=\"noopener\">News</a></li>\n    </ul>\n    <h3>Ecosystem</h3>\n    <ul>\n      <li><a href=\"https://router.vuejs.org\" target=\"_blank\" rel=\"noopener\">vue-router</a></li>\n      <li><a href=\"https://vuex.vuejs.org\" target=\"_blank\" rel=\"noopener\">vuex</a></li>\n      <li><a href=\"https://github.com/vuejs/vue-devtools#vue-devtools\" target=\"_blank\" rel=\"noopener\">vue-devtools</a></li>\n      <li><a href=\"https://vue-loader.vuejs.org\" target=\"_blank\" rel=\"noopener\">vue-loader</a></li>\n      <li><a href=\"https://github.com/vuejs/awesome-vue\" target=\"_blank\" rel=\"noopener\">awesome-vue</a></li>\n    </ul>\n  </div>\n</template>\n\n<script>\nexport default {\n  name: 'HelloWorld',\n  props: {\n    msg: String\n  }\n}\n</script>\n\n<!-- Add \"scoped\" attribute to limit CSS to this component only -->\n<style scoped>\nh3 {\n  margin: 40px 0 0;\n}\nul {\n  list-style-type: none;\n  padding: 0;\n}\nli {\n  display: inline-block;\n  margin: 0 10px;\n}\na {\n  color: #42b983;\n}\n</style>\n",
}
```

我们来看一下这个 middleware 函数的代码：

```javascript
async (files) => {
        const data = this._resolveData(additionalData)
        const globby = require('globby')
        const _files = await globby(['**/*'], { cwd: source, dot: true })
        for (const rawPath of _files) {
          const targetPath = rawPath.split('/').map(filename => {
            // dotfiles are ignored when published to npm, therefore in templates
            // we need to use underscore instead (e.g. "_gitignore")
            if (filename.charAt(0) === '_' && filename.charAt(1) !== '_') {
              return `.${filename.slice(1)}`
            }
            if (filename.charAt(0) === '_' && filename.charAt(1) === '_') {
              return `${filename.slice(1)}`
            }
            return filename
          }).join('/')
          const sourcePath = path.resolve(source, rawPath)
          const content = renderFile(sourcePath, data, ejsOptions)
          // only set file if it's not all whitespace, or is a Buffer (binary files)
          if (Buffer.isBuffer(content) || /[^\s]/.test(content)) {
            files[targetPath] = content
          }
        }
      }

```

他这里面用到了很多 GeneratorAPI 里面的函数。

handle imports and root option injections
这个相当于没有，因为未能一次进入 if 的逻辑
```javascript
// handle imports and root option injections
Object.keys(files).forEach(file => {
    let imports = this.imports[file]
    imports = imports instanceof Set ? Array.from(imports) : imports
    if (imports && imports.length > 0) {
    files[file] = runTransformation(
        { path: file, source: files[file] },
        require('./util/codemods/injectImports'),
        { imports }
    )
    }

    let injections = this.rootOptions[file]
    injections = injections instanceof Set ? Array.from(injections) : injections
    if (injections && injections.length > 0) {
    files[file] = runTransformation(
        { path: file, source: files[file] },
        require('./util/codemods/injectOptions'),
        { injections }
    )
    }
})
```

跳回 generate 函数，

将 this.files 的内容听过 node 的 fs.writeFileSync 写文件

```javascript
    await writeFileTree(this.context, this.files, initialFiles, this.filesModifyRecord)
```

