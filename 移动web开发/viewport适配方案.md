### 移动端适配之 viewport 方案

> rem 适配方案已经淘汰了

与 rem 适配方案使用 postcss-pxtorem 类似，viewport 适配方案使用的是 postcss-px-to-viewport 则是将 px 单位转换为 vh、vw

```javascript
npm install postcss-px-to-viewport --save-dev
```

然后新建一个 postcss.config.js 文件

```javascript
const path = require("path")
module.exports = ({webpack}) => {
    // 这一行是为了解决组件库 vant 的 375px 设计稿不兼容的问题。
    const viewWidth = webpack.resourcePath.includes(path.join("nide_modules", "vant")) ? 375 : 750
    return {
         plugins: {
             autoprefixer: {},
             "postcss-px-to-viewport": {
                 unitToConvent: "px",
                 viewportWidth: viewWidth,
                 unitPrecision: 5,
                 propList: ["*"],
                 viewportUnit: "vw",
                 fontViewportUnit: "vw",
                 selectorBlackList: [],
                 minPixlValue: 1,
                 mediaQuery: true,
                 exclude: [],
                 lanscape: false
             }
         }
    }
}
```
