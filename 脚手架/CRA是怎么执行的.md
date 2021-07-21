### 前戏

首先我们先下载 create-react-app

(下载地址：git@github.com:facebook/create-react-app.git)

进入 create-react-app/packages/create-react-app,看到 package.json:

```json
  "version": "4.0.3",
  "bin": {
    "create-react-app": "./index.js"
  },
```

第一，我的 version 版本为 4.0.3；第二，这个 bin 字段的值表明，使用 cra 时找的是 index.js

除去注释，index.js 只有下面这一些些代码：

```javascript
'use strict';

var currentNodeVersion = process.versions.node;
var semver = currentNodeVersion.split('.');
var major = semver[0];

if (major < 10) {
  console.error(
    'You are running Node ' +
      currentNodeVersion +
      '.\n' +
      'Create React App requires Node 10 or higher. \n' +
      'Please update your version of Node.'
  );
  process.exit(1);
}

const { init } = require('./createReactApp');

init();

```
这个 index 的逻辑十分简单，前面检查了一下版本是不是 10 或者以上，然后就调用 ./createReactApp 里面的 init() 函数。

现在，我们沿着这个 init() 函数来一步步分析它是怎么执行的。

ctrl + f，输入 "init"，我们来看一下 init 函数,这里显示是第 54 行到 236 行。不到两百行代码。我们把这个代码可以分为两部分，其中第一部分时包括有 100 多行 commander 的机械化的代码，很容易看明白。第二部分是 40 行的关键代码，它将其他 1000 行左右的代码调动起来。

首先，一上来看到的是 Commander 模块相关的代码，是第 54 行到 187 行

```javascript
const program = new commander.Command(packageJson.name)
.xxx
.xxx
.xxx
......
```
你可以输入诸如：

- npx create-react-app --help
- npx create-react-app --verbose
- npx create-react-app --info
。。。

来看这个代码块到底发生了什么。

如果想深入了解，可以看它的文档：https://github.com/tj/commander.js

### 核心代码分析

然后我们可以看第 195 到第 235 行代码，这里是核心代码，这 1000 多行的代码都要靠它调动起来。

```javascript
  checkForLatestVersion()
    .catch(() => {
      try {
        return execSync('npm view create-react-app version').toString().trim();
      } catch (e) {
        return null;
      }
    })
    .then(latest => {
      if (latest && semver.lt(packageJson.version, latest)) {
        console.log();
        console.error(
          chalk.yellow(
            `You are running \`create-react-app\` ${packageJson.version}, which is behind the latest release (${latest}).\n\n` +
              'We no longer support global installation of Create React App.'
          )
        );
        console.log();
        console.log(
          'Please remove any global installs with one of the following commands:\n' +
            '- npm uninstall -g create-react-app\n' +
            '- yarn global remove create-react-app'
        );
        console.log();
        console.log(
          'The latest instructions for creating a new app can be found here:\n' +
            'https://create-react-app.dev/docs/getting-started/'
        );
        console.log();
        process.exit(1);
      } else {
        createApp(
          projectName,
          program.verbose,
          program.scriptsVersion,
          program.template,
          program.useNpm,
          program.usePnp
        );
      }
    });
```

#### checkForLatestVersion

```javascript
function checkForLatestVersion() {
  return new Promise((resolve, reject) => {
    https
      .get(
        'https://registry.npmjs.org/-/package/create-react-app/dist-tags',
        res => {
          if (res.statusCode === 200) {
            let body = '';
            res.on('data', data => (body += data));
            res.on('end', () => {
              resolve(JSON.parse(body).latest);
            });
          } else {
            reject();
          }
        }
      )
      .on('error', () => {
        reject();
      });
  });
}
```

我们在浏览器上访问一下这个接口，发现它的返回结果是这样：

```json
{"next":"4.0.0-next.117","latest":"4.0.3","canary":"3.3.0-next.38"}
```

可以看到 checkForLatestVersion 的逻辑是失败就被接下来的 catch 抓掉，成功就 resolve 一个 "latest" 的值。然后 then 里面会比较当前 cra 版本与最新的 cra 版本。不一致就打印一下相关 log 并且退出进程。

#### createApp

假如代码正确执行，那么就会执行 createApp 这个函数：是 238 到 352 行。

1、从 239 到 267 是检查诸如 node 版本、项目名称等问题。

2、269 到 277 行：

```javascript
  const packageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
  };
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );
```

这里 cra 创建了一个 package.json 的文件。

3、第 279 到 340，判断是使用 yarn、useNpm 还是 Pnp

4、第 342 到 351，是一个 run 函数

```javascript
  run(
    root,
    appName,
    version,
    verbose,
    originalDirectory,
    template,
    useYarn,
    usePnp
  );
```
#### run

run 函数是 426 到 579 行，从结构上看就是下面这样：

```javascript
  Promise.all([
    getInstallPackage(version, originalDirectory),
    getTemplateInstallPackage(template, originalDirectory),
  ]).then(([packageToInstall, templateToInstall]) => {
      xxx
  }
```

所以就看一下 getInstallPackage，这是 581 到 629 行，它是这样一个结构：

```javascript
function getInstallPackage(version, originalDirectory) {
  let packageToInstall = 'react-scripts';

  // 此处省略 100 多行，因为都是对 packageToInstall 这个字符串的修饰

  return Promise.resolve(packageToInstall);
}
```

再看一下 631 到 676 行，是这么一个结构：

```javascript
function getTemplateInstallPackage(template, originalDirectory) {
  let templateToInstall = 'cra-template';
  if (template) {
      // 选择一个模板，覆盖掉 templateToInstall 这个变量
  }
  return Promise.resolve(templateToInstall);
}
```

现在，我们到了 then 的逻辑：440 到 579，是一个 promise.all 加 3 then 1 catch 结构：

```javascript
const allDependencies = ['react', 'react-dom', packageToInstall];

console.log('Installing packages. This might take a couple of minutes.');

Promise.all([
    getPackageInfo(packageToInstall),
    getPackageInfo(templateToInstall),
]).then()
  .then()
  .then()
  .catch()
```

#### getPackageInfo