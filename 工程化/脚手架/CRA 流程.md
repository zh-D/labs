#### index.js-->createReactApp.js/init():

- 使用 commander 注册命令行选项
- 如果 program.info 存在则 log 出 Environment Info:
- 如果项目 projectName 没有指定则退出进程
- 检查 CRA 的版本，低了就退出进程
- 没问题则调用 createApp 函数

#### createApp(projectName, program.verbose, program.scriptsVersion, program.template, program.useNpm, program.usePnp)

- 检查 Node 版本，不和要求则退出进程

- 检查项目 projectName 不和规则则退出

- 创建仅包含以下内容的 packageJson

  - ```javascript
      const packageJson = {
        name: appName,
        version: '0.1.0',
        private: true,
      };
    ```

- 处理使用 npm、yarn、pnp 的逻辑
- 调用 run() 方法

#### run(root, appName, version, verbose, originalDirectory, template, useYarn, usePnp) 

- Promise.all 在一般情况下返回一个 ['react-scripts',  'cra-template']
- 按照一般情况，安装依赖 ['react', 'react-dom', 'react-scripts']
- 第二次 Promise.all 一般返回一个 [{name: "react-scripts"}, {name: "cra-template"}]
- 紧接着判断以下 isOnline，一般是返回 true
- 判断一下 react-scripts 的版本是否和 template  的版本匹配，但一般 react-scripts 传入的版本为 null，会被赋值为 ‘3.3.0’，和 templatesVersion 匹配，于是把 'cra-template' 依赖推入安装的依赖，所以 allDependencies 为 ['react', 'react-dom', 'react-scripts'，'cra-template']
- 最后运行 install()

#### install(root, useYarn, usePnp, allDependencies, verbose, isOnline)

- 先处理使用 yarn 的一些命令行参数
- `const child = spawn(command, args, { stdio: 'inherit' });`，它帮你下载好依赖。如我用 yarn 就是：yarnpkg add --exact react react-dom react-scripts cra-template --cwd c:\\xxx
- 到目前为止，['react', 'react-dom', 'react-scripts'，'cra-template'] 的依赖已经下好了，它的package.json 和 create-react-app 的 package.json 差不多一样（完全复制了，但是增加了四个 dependencies）

#### 最后一个 then()

- checkNodeVersion('react-scripts') // 检查当前`Node`版本是否支持包

- setCaretRangeForRuntimeDeps('react-scripts');// 检查`package.json`的开发依赖是否正常

- await executeNodeScript(xxx, xxx, `

  ​    var init = require('${packageName}/scripts/init.js');

  ​    init.apply(null, JSON.parse(process.argv[1]));`); 在这个函数内部是这么调用 

  - ```javascript
    
    const child = spawn(
        process.execPath,
        [...args, '-e', source, '--', JSON.stringify(data)],
        { cwd, stdio: 'inherit' }
    );
    
    source = '\n        var init = require('react-scripts/scripts/init.js');\n        init.apply(null, JSON.parse(process.argv[1]));\n      '
    
    JSON.stringify(data) = '["c:\\Users\\86155\\Desktop\\仓库\\create-react-app\\ttt","ttt",null,"c:\\Users\\86155\\Desktop\\仓库\\create-react-app","cra-template"]'
    
    const child = spawn(
        'C:\\Program Files\\nodejs\\node.exe',
        [null, '-e', source, '--', JSON.stringify(data),
         { cwd, stdio: 'inherit' }
    );' 
    ```

- 然后 init.js 就 Installing template dependencies、Removing template package 

#### init(appPath, appName, verbose, originalDirectory, templateName)

函数参数是从 JSON.stringify(data) 里面拿的。

- 在 cra-template 里面有一个 template.json 的文件，文件里有 package.dependencies，templatePackage 就是这个 package

- 这个 package.denpendencies 和 scripts 会被加到你创建的那个项目里面的 dependences。（这里只有 package.dendencies，没有package.scripts）

- 然后会加四个命令：

  - ```javascript
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

- 添加 eslint config

  - ```javascript
      // Setup the eslint config
      appPackage.eslintConfig = {
        extends: 'react-app',
      };
    ```

- Setup the browsers list

  - ```javascript
    const { defaultBrowsers } = require('react-dev-utils/browsersHelper');
    appPackage.browserslist = defaultBrowsers;
    ```

- 要加的依赖写到 appPackge

  - ```javascript
      templatePackageToReplace.forEach(key => {
        appPackage[key] = templatePackage[key];
      });
    
    ```

- 写入 package.json

  - ```javascript
      fs.writeFileSync(
        path.join(appPath, 'package.json'),
        JSON.stringify(appPackage, null, 2) + os.EOL
      );
    
    ```

- 生成 README

  - ```javascript
      const readmeExists = fs.existsSync(path.join(appPath, 'README.md'));
      if (readmeExists) {
        fs.renameSync(
          path.join(appPath, 'README.md'),
          path.join(appPath, 'README.old.md')
        );
      }
    ```

- 去 cra-template 的 template 文件夹下拷贝文件

  - ```javascript
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

- 生成 .gitignore
- init 成一个 git 仓库
- 把 template 里面的依赖也添加到 package.json
- 检查有没有安装 react 和 react-dom，为了向后兼容，没有安装又要添加到 package.json 里面
- 安装 react 和 react-dom 如果没有安装
- 使用 npm/yarn 命令移除安装模板 cra-template
- git commit
- Display the most elegant way to cd.
- Change displayed command to yarn instead of yarnpkg

