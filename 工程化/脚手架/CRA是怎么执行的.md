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

现在，我们到了 run 函数中的 then 的逻辑：440 到 579，是一个 promise.all 加 3 then 1 catch 结构：

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

```javascript
function getPackageInfo(installPackage) {
  if (installPackage.match(/^.+\.(tgz|tar\.gz)$/)) {

  } else if (installPackage.startsWith('git+')) {

  } else if (installPackage.match(/.+@/)) {

  } else if (installPackage.match(/^file:/)) {

  }
  return Promise.resolve({ name: installPackage });
}
```

这里根据正则表达式来匹配对应的逻辑。

#### 第一个 then

```javascript
.then(([packageInfo, templateInfo]) =>
  checkIfOnline(useYarn).then(isOnline => ({
    isOnline,
    packageInfo,
    templateInfo,
  }))
)
```

这里检查是否在线

#### 第二个 then

第 455 到 503 行

456 行到 489 行

这里检查 packages 和 template 的版本，看是否支持，支持就把它扔进 allDependencies 里面，然后 install

```javascript
install(
  root,
  useYarn,
  usePnp,
  allDependencies,
  verbose,
  isOnline
)
```

#### install

第 363 到 424 行代码

从 365 到 411 行是处理 yarn、npm、pnp 的逻辑

从 413 到 423 行

```javascript
// (const spawn = require('cross-spawn');
const child = spawn(command, args, { stdio: 'inherit' });
child.on('close', code => {
  if (code !== 0) {
    reject({
      command: `${command} ${args.join(' ')}`,
    });
    return;
  }
  resolve();
});
```
异步生成 npm，这里要看一下 cross-spawn 源码

#### 第三个 then

30 行代码

```javascript
.then(async ({ packageInfo, supportsTemplates, templateInfo }) => {
  const packageName = packageInfo.name;
  const templateName = supportsTemplates ? templateInfo.name : undefined;
  checkNodeVersion(packageName);
  setCaretRangeForRuntimeDeps(packageName);

  const pnpPath = path.resolve(process.cwd(), '.pnp.js');

  const nodeArgs = fs.existsSync(pnpPath) ? ['--require', pnpPath] : [];

  await executeNodeScript(
    {
      cwd: process.cwd(),
      args: nodeArgs,
    },
    [root, appName, verbose, originalDirectory, templateName],
    `
  var init = require('${packageName}/scripts/init.js');
  init.apply(null, JSON.parse(process.argv[1]));
`
  );

  if (version === 'react-scripts@0.9.x') {
    console.log(
      chalk.yellow(
        `\nNote: the project was bootstrapped with an old unsupported version of tools.\n` +
          `Please update to Node >=10 and npm >=6 to get supported tools in new projects.\n`
      )
    );
  }
})
```

这里两个函数 setCaretRangeForRuntimeDeps 和 executeNodeScript

先看 setCaretRangeForRuntimeDeps

**setCaretRangeForRuntimeDeps**

```javascript
function setCaretRangeForRuntimeDeps(packageName) {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = require(packagePath);

  if (typeof packageJson.dependencies === 'undefined') {
    console.error(chalk.red('Missing dependencies in package.json'));
    process.exit(1);
  }

  const packageVersion = packageJson.dependencies[packageName];
  if (typeof packageVersion === 'undefined') {
    console.error(chalk.red(`Unable to find ${packageName} in package.json`));
    process.exit(1);
  }

  makeCaretRange(packageJson.dependencies, 'react');
  makeCaretRange(packageJson.dependencies, 'react-dom');

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + os.EOL);
}
```

**makeCareRange**

```javascript
function makeCaretRange(dependencies, name) {
  const version = dependencies[name];

  if (typeof version === 'undefined') {
    console.error(chalk.red(`Missing ${name} dependency in package.json`));
    process.exit(1);
  }

  let patchedVersion = `^${version}`;

  if (!semver.validRange(patchedVersion)) {
    console.error(
      `Unable to patch ${name} dependency version because version ${chalk.red(
        version
      )} will become invalid ${chalk.red(patchedVersion)}`
    );
    patchedVersion = version;
  }

  dependencies[name] = patchedVersion;
}

```

#### executeNodeScript

```javascript
function executeNodeScript({ cwd, args }, data, source) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [...args, '-e', source, '--', JSON.stringify(data)],
      { cwd, stdio: 'inherit' }
    );

    child.on('close', code => {
      if (code !== 0) {
        reject({
          command: `node ${args.join(' ')}`,
        });
        return;
      }
      resolve();
    });
  });
}

```

最后是 catch 的逻辑不多说了

到目前为止，已经创建了一个文件夹，里面有 node_module、package.json、yarn.lock

package.json 如下：

```json
{
  "name": "your-project-name",
  "version": "0.1.0",
  "private": true
}


```

yarn.lock 则有 1w 多行

但是我们回到 excuteNodeScript，它的 source 值如下：

```javascript
`
  var init = require('${packageName}/scripts/init.js');
  init.apply(null, JSON.parse(process.argv[1]));
`
```

现在我们来看一下 scripts/init.js,从 84 到 407 行，核心代码如下：

```javascript
  const appPackage = require(path.join(appPath, 'package.json'));
  const templatePackage = templateJson.package || {};

// 修改 package.json
  appPackage.scripts = Object.assign(
    {
      start: 'react-scripts start',
      build: 'react-scripts build',
      test: 'react-scripts test',
      eject: 'react-scripts eject',
    },
    templateScripts
  );

// 生成 package.json
  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );

// 拷贝 template 文件
  const templateDir = path.join(templatePath, 'template');
  if (fs.existsSync(templateDir)) {
    fs.copySync(templateDir, appPath);
  }
```

细节如下：

91 到 139 行代码：
- 判断有没有模板名，没有贼 return
- 看一下 template.json 里面有没有 dependences 或者 scripts，有就打印一个 deprecated 警告

141 到 178 行代码：

```javascript
  // Keys to ignore in templatePackage
  const templatePackageBlacklist = [
    'name',
    'version',
    'description',
    'keywords',
    'bugs',
    'license',
    ...//此处省略
  ];

  // Keys from templatePackage that will be merged with appPackage
  const templatePackageToMerge = ['dependencies', 'scripts'];

  // Keys from templatePackage that will be added to appPackage,
  // replacing any existing entries.
  const templatePackageToReplace = Object.keys(templatePackage).filter(key => {
    return (
      !templatePackageBlacklist.includes(key) &&
      !templatePackageToMerge.includes(key)
    );
  });
```

第 180 到 193 行：

```javascript
  // Copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {};

  // Setup the script rules
  const templateScripts = templatePackage.scripts || {};
  appPackage.scripts = Object.assign(
    {
      start: 'react-scripts start',
      build: 'react-scripts build',
      test: 'react-scripts test',
      eject: 'react-scripts eject',
    },
    templateScripts
  );

```
195 到 204,为 yarn 用户增加 scripts

```javascript
  // Update scripts for Yarn users
  if (useYarn) {
    appPackage.scripts = Object.entries(appPackage.scripts).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value.replace(/(npm run |npm )/, 'yarn '),
      }),
      {}
    );
  }
```

206 到 217,读注释

```javascript
  // Setup the eslint config
  appPackage.eslintConfig = {
    extends: 'react-app',
  };

  // Setup the browsers list
  appPackage.browserslist = defaultBrowsers;

  // Add templatePackage keys/values to appPackage, replacing existing entries
  templatePackageToReplace.forEach(key => {
    appPackage[key] = templatePackage[key];
  });
```

219 到 222，生成 package.json

```javascript
  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );
```

224 到 230，如果存在 READMD.md 就改名成 "old"

```javascript
  const readmeExists = fs.existsSync(path.join(appPath, 'README.md'));
  if (readmeExists) {
    fs.renameSync(
      path.join(appPath, 'README.md'),
      path.join(appPath, 'README.old.md')
    );
  }
```

232 到 241 行,拷贝 template

```javascript
  // Copy the files for the user
  const templateDir = path.join(templatePath, 'template');
  if (fs.existsSync(templateDir)) {
    fs.copySync(templateDir, appPath);
  } else {
    console.error(
      `Could not locate supplied template: ${chalk.green(templateDir)}`
    );
    return;
  }

```

257 到 271 行，处理 .gitignore 文件

```javascript
  const gitignoreExists = fs.existsSync(path.join(appPath, '.gitignore'));
  if (gitignoreExists) {
    // Append if there's already a `.gitignore` file there
    const data = fs.readFileSync(path.join(appPath, 'gitignore'));
    fs.appendFileSync(path.join(appPath, '.gitignore'), data);
    fs.unlinkSync(path.join(appPath, 'gitignore'));
  } else {
    // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
    // See: https://github.com/npm/npm/issues/1862
    fs.moveSync(
      path.join(appPath, 'gitignore'),
      path.join(appPath, '.gitignore'),
      []
    );
  }
```

273 到 280 行，初始化生成的 app 为 git 仓库

```javascript
  let initializedGit = false;

  if (tryGitInit()) {
    initializedGit = true;
    console.log();
    console.log('Initialized a git repository.');
  }
```

282 到 299，根据使用 yarn 还是 npm 生成 command、remove、args

```javascript
  if (useYarn) {
    command = 'yarnpkg';
    remove = 'remove';
    args = ['add'];
  } else {
    command = 'npm';
    remove = 'uninstall';
    args = [
      'install',
      '--no-audit', // https://github.com/facebook/create-react-app/issues/11174
      '--save',
      verbose && '--verbose',
    ].filter(e => e);
  }
```
301 到 312 行，下载依赖：

```javascript
  // Install additional template dependencies, if present.
  const dependenciesToInstall = Object.entries({
    ...templatePackage.dependencies,
    ...templatePackage.devDependencies,
  });
  if (dependenciesToInstall.length) {
    args = args.concat(
      dependenciesToInstall.map(([dependency, version]) => {
        return `${dependency}@${version}`;
      })
    );
  }
```

314 到 318 行，向后兼容老版本的 CRA 下载 react and react-dom（react and react-dom 没有被 react-scripts 下载）

```javascript
  // Install react and react-dom for backward compatibility with old CRA cli
  // which doesn't install react and react-dom along with react-scripts
  if (!isReactInstalled(appPackage)) {
    args = args.concat(['react', 'react-dom']);
  }

```

320 到 330 行

```javascript
  // Install template dependencies, and react and react-dom if missing.
  if ((!isReactInstalled(appPackage) || templateName) && args.length > 1) {
    console.log();
    console.log(`Installing template dependencies using ${command}...`);

    const proc = spawn.sync(command, args, { stdio: 'inherit' });
    if (proc.status !== 0) {
      console.error(`\`${command} ${args.join(' ')}\` failed`);
      return;
    }
  }

```

332 到 335 行，检查是否安装 ts

```javascript
  if (args.find(arg => arg.includes('typescript'))) {
    console.log();
    verifyTypeScriptSetup();
  }

```

第 337 到 349 行

```javascript
  // Remove template
  console.log(`Removing template package using ${command}...`);
  console.log();

```

第 341 到 347 行

```javascript
  const proc = spawn.sync(command, [remove, templateName], {
    stdio: 'inherit',
  });
  if (proc.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`);
    return;
  }
```

349 到 353 行, git commit

```javascript
  // Create git commit if git repo was initialized
  if (initializedGit && tryGitCommit(appPath)) {
    console.log();
    console.log('Created git commit.');
  }
```

355 到 363 行

```javascript
  // Display the most elegant way to cd.
  // This needs to handle an undefined originalDirectory for
  // backward compatibility with old global-cli's.
  let cdpath;
  if (originalDirectory && path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }
```

356 到 415 行。打印 log

到这里 CRA 的主流程就基本走完了，还有 build、eject、init、start、test 等命令，后续再看。
