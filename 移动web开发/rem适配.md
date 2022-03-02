### rem 实现自适应布局

rem 适配方式可以达到高宽都自适应，内容可自适应。即等比例缩放。

```css
html {
    font-size: 50px; /*为 1rem 设置为 50px*/
}

/* 需要适配主流设备 */
@media (min-width: 320px) {
    html {
        font-size: 50px;
    }
}

@media (min-width: 640px) {
    html {
        font-size: 100px;
    }
}

/* rem 基于根元素（html）的字体大小来的 */
.rem {
    font-size: 2rem;
}
```

### rem + @media + scss/less

```scss
@deviceWidthList: 320px, 360px, 375px, 384px, 400px, 414px, 424px, 480px, 540px, 640px, 720px, 750px;

/* length 和 extract 为 less 的函数 */
.adapterFuc (@index) when (@index <= length(@deviceWidthList)) {
    @psdWidth: 750;
    @baseSize: 100;
    @media (min-width: extract(@deviceWidthList, @index)) {
        html {
            font-size: extract(@deviceWidthList, @index)/@psdWidth*@baseSize
        }
    }
    .adapterFuc(@index + 1)
}
.adapterFuc(@deviceWidthList)

```

### 移动端适配四种方式总结

伸缩容器是适配： flex

流式布局： 百分比单位

响应式布局：媒体查询（在超小屏幕使用的还是流式布局）

rem 适配方式：rem 主要可以改变内容的大小，可以结合流式布局和伸缩布局做移动端的整体适配
