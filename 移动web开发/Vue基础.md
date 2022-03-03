## Vue 基础

### MVVM 什么意思

我们从后端请求的数据存放到 Vue 的 M 层，V 代表了视图，然后 VM 层他是一个中间人，为 V 和 M 通信进行服务

### Vue 指令

- v-cloak：防止出现类似于 {{msg}}（插值表达式） 的信息
- v-text：也不会出现闪烁问题，他会覆盖元素原本的内容
- v-html：输出 html，危险
- v-bind：绑定变量到属性
- v-on：绑定事件到属性
- v-model：它的使用非常像 react 里面的受控组件。实现数据的双向绑定
- v-if 和 v-show：v-if 和 v-show 适用的场景不一样，`v-if` 有更高的切换开销，而 `v-show` 有更高的初始渲染开销。因此，如果需要非常频繁地切换，则使用 `v-show` 较好；如果在运行时条件很少改变，则使用 `v-if` 较好

#### v-for

- v-for="item in list"：list 为数组

- v-for="(var, key) in list"：list 为数组

- v-for="(val,key,i) in list2"：list 为对象

- v-for="count in 10"：count 从 1 开始到 10

### 事件修饰符

- .stop：阻止冒泡
- .prevent：如阻止 a 链接的跳转
- .capture：使用捕获机制
- .self：只有点击自身才能触发事件
- .once：指触发一次，可以修饰事件修饰符

.self 和 .stop 的区别：.self 还是会冒泡。

### 在 Vue 中使用样式

- 数组1：:class="['red', 'thin']"
- 数组2：:class="['red', 'thin', isActive ? 'actice' : '']"
- 数组3：:class="['red', 'thin', {'active': isActive}]"
- 对象：:class="{red: true, italic: true, active: true, thin:true}"
- 内联样式：:style="{color: 'red', 'font-size': '40px'}"

### Vue 的全局/私有过滤器

```javascript
// 这个是文本过滤
Vue.filter('msgFormat', function (msg) {
    return msg.replace(/单纯/g,'邪恶')
})

<p>{{ msg | msgFormat }}</p>

// 这个是日期格式过滤
Vue.filter('dateFormat', function (dateStr, pattern = '') {
    // padStart 可以补 0
    let dt = new Date(dateStr)
    
    // yyyy-mm-dd
    let y = dt.getFullYear()
    let m = dt.getMonth() + 1
    let d = dt..getDate()

    if (pattern.toLowerCase() === 'yyyy-mm-dd') {
        return `${y}-${m}-${d}` 
    } else {
        let hh = dt.getHours()
        let mm = dt.getMinutes()
        let ss = dt.getSeconds()
        return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
    }
})



let privateVm = new Vue({
    el: '#app2',
    data: {
        dt: new Date()
    },
    methods: {},
    filters: {
        // 私有过滤器优先于全局过滤器
        dateFormate: function (dateStr, pattern = '') {
            let dt = new Date(dateStr)

            // yyyy-mm-dd
            let y = dt.getFullYear()
            let m = dt.getMonth() + 1
            let d = dt..getDate()

            if (pattern.toLowerCase() === 'yyyy-mm-dd') {
                return `${y}-${m}-${d}` 
            } else {
                let hh = dt.getHours()
                let mm = dt.getMinutes()
                let ss = dt.getSeconds()
                return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
            }
        }
    }
})
```

### Vue 的全局/私有自定义指令

```javascript
// 自定义的时候指令名称不需要加 v- 前缀，在调用的时候，必须在指令前加 v- 前缀
// 每个钩子函数的第一个传参永远是 el，是一个原始 js、dom 的对象
// 每个钩子函数的第二个参数永远是 binding，包含了 name（指令名）、value（） 等

// 全局方式
Vue.directive('func', {
    // bind：指令第一次绑定到元素时调用
    bind: function () {
        // 这时元素还没有插入到 dom
        // 你可以放 style 的改变在这里，改变 vdom
    }
    // inserted：被绑定元素插入父节点完成之后调用（父节点存在即可调用，不必存在于 document 中）
    inserted: function (el) {
        // 和 js 行为有关的放这里
        el.focus()
    },
    // update：所在组件的 VNode 更新时调用
    updated: function () {}
    // componentUpdated：所在组件的 VNode 以及其孩子的 VNode 全部更新时调用
	componentUpdated: function () {}
    // unbind：只调用一次，指令与元素解绑时调用
    unbind: function () {}
})

// 私有方式
let vm = new Vue({
    directives: {
        "font-weight": {
            bind: function (el, binding) {
                ...
            }
        }
    }
})
    
// 简写，只希望在 bind 和 update 钩子上做重复动作，并不想关心其他的钩子函数，可以这样写：
// 这样等同于写到 bind 和 update 上
Vue.directive("name", function (el, binding) {
    el.style.backgroundColor = binding.value
})
```

### Vue 的生命周期钩子

分为创建时、运行时、销毁时。

创建时

- beforeCreate：在这个方法执行时，Vue 实例是一个只有默认属性和行为的 “空对象”，即没有 data、methods 等。


- created：这个方法执行时，data 和 methods 都已经初始化好了。


- 然后要进行模板编译：就是把 el 和 template 初始化一下，并且执行指令，最终形成一个已经编译好的字符串模板字符串，然后渲染为内存中的 dom。但还没有挂载。

- beforeMount：页面上还没有内容，已经可以操作 dom 了。

- mounted：遇到的第四个生命周期函数，表示内存中的模板，已经真实的挂载到页面中。

运行时：when data changes

- beforeUpdate：data 是新的，页面是旧的。
- updated：data 和 页面都是新的。

销毁时

- beforeDestory：实例身上所有的 data 和所有的 methods，以及过滤器、指令...... 都处于可用状态
- destroyed：Vue 实例完全销毁了

### vue-resource 实现 Ajax

除了 vue-resource 还可以使用 axios 来实现网络请求

```javascript
// 1、安装 vue-resource
// 2、使用
new Vue({
    methods: {
        getInfo() {
            this.$http.get(url, [body], [options]).then(function (res) {
                console.log(res.body)
            })
        }
        
    }
})
```

### Vue 的动画

#### Vue 的动画基础

- Enter：v-enter、v-enter-to、v-enter-active

- Leave：v-leave、v-leave-to、v-leave-active

```html
<-- 首先使用 transition 标签把一个 v-show 标签包裹起来。-->
<transition>
  <h1 v-show="flag">I'm H3</h1>    
</transition>
    
<-- 然后定义样式 -->
.v-enter,
.v-leave-to {
    opacity: 0;
    transform: translateX(150px)
}
    
.v-enter-active,
.v-leave-active {
    transiton: all 0.8s ease;
}

// 然后这个 h1 元素就会实现动画效果
// 但是这个会作用于所有被 transition 包起来的元素
// 因为默认 transition 的 name 为 “v”，我们可以改变名字为特定元素实现特殊的动画
<transition name="x">
  <h1 v-show="flag">I'm H3</h1>    
</transition>
    
<-- 然后定义样式 -->
.x-enter,
.x-leave-to {
    opacity: 0;
    transform: translateX(150px)
}
    
.x-enter-active,
.x-leave-active {
    transiton: all 0.8s ease;
}   
```

#### Vue 使用第三方动画

```html
<link rel="stylesheet" href="./lib/animate.css" >

<transition 
    enter-active-class="animated bounceIn" 
    leave-active-class="animated bounceOut" 
    v-bind:duration="{ enter: 200, leave: 400 }"
>
  <h3 v-show="flag">
      H3333
  </h3>
</transition>
```

#### Vue 使用动画的钩子函数实现半场动画

半场动画：只 enter 不 leave，或者只 leave 不 enter

enter

- v-on:before-enter="beforeEnter"
- v-on:enter
- v-on:after_enter
- v-on:enter-cancelled

leave

- v-on:before-leave
- v-on:leave
- v-on:after-leave
- v-on:leave--cancelled

所以在 method 定义钩子函数的行为，就可以了

#### Vue 使用 transition-group 实现列表动画

```html
v-enter,
v-enter-to {
  opacity: 0,
  transform: translateY(80px)
}

v-enter-active,
v-enter-active {
  transition: all 0.6s ease;
}
li:hover {
  background: blue;
  transition: 1s;
}

// appear 实现入场效果
// transition-group tag 默认是 span。在这里我们可以设为 ul
<ul>
    <transition-group appear tag="ul">
      <li v-for="item in list" v-bind:key="item.id">
        hellow world
      </li>    
    </transition-group>
</ul>
```

### 模块化和组件化的区别

模块化：在代码逻辑的角度来划分代码。方便代码分层开发，保证每个功能模块的智能单一

组件化：从 UI 界面的角度来划分代码。方便 UI 的复用

### 创建组件的四种方式

```javascript
// 创建组件：法一
let templateObj = Vue.extend({
    // 指定组件要展示的 HTML 结构
    template: "",
})

Vue.component("compA", templateObj)
// 驼峰命名的话需要换成 ”-“ 命名调用
<vm-a> </vm-a>

// 创建组件：法二
Vue.component("compA", Vue.extend({
    // 指定组件要展示的 HTML 结构
    template: "",
}))

// 法一和法二写模板 HTML 的时候没有代码提示

// 创建组件：法三
<template id="tmp1">
   <div>
      我是组件的 compB 的 template
    </div>    
</template>
Vue.component("compB", {
    template: "#tmp1"
})

// 实际上就是 Vue.component，只是创建模板的时候方式各不相同
Vue.component()

// 实例的 data 可以为对象
// 组件中的 data 必须为一个返回对象的方法，如果是对象，那么如果创建多个组件实例。所以实例都共享一个对象。


// 私有组件
let login = {
    template: '<h1>1234</h1>'
}

let vm = new Vue({
    el: "#app",
    components: {
        login
    }
})
```

### 组件切换

#### 组件切换两种方式

- v-if/v-else
- <component :is="compName"

#### 组件切换动画

只需要将 <component :is="compName" 用 transition 包起来，然后定义 .v-enter、.v-leave-to、.v-enter-active、.v-leave-active

```html
<transition mode="out-in">
  <component :is="comName"></component>
</transition>
```

### 组件传值

#### 父向子传

默认子组件无法访问到父组件中的 data 上的数据和 methods

```html
子组件定义 props 属性，父组件通过 v-bind 属性传值
```

#### 子向父传

这个可以发表评论自动刷新

```html
首先父组件向子组件传递方法 'func'
子组件调用 this.$emit('func', "arg1", "arg2")
func 里面写 this.sonData = arg1
```

### Ref

#### Ref 获取 dom

```html
<h3 id="app" ref="container">
    hello world
</h3>

<script>
  this.$refs.container.innerText === "hello world"
</script>
```

#### Ref 获取组件 data

```javascript
let login = {
    template: "<h1>登陆组件</h1>",
    data() {
        return {
            msg: "son msg"
        }
    }
}

<login ref="login"></login>

this.$refs.login.msg === "son msg"
```

### Watch

#### watch 监听文本框

```javascript
let vm = new Vue({
    data: function () {
        firstname: ""
    }
    // 可以监听 data 里面的数据变化
    watch: {
        "firstname": funciton (newVal, oldVal) {
        	this.fullnmae = this.firstname + this.lastname
    	}
    }
})

```

#### watch 监听路由地址

```javascript
let vm = new Vue({
    router,
    watch: {
        '$routes.path': function (newVal, oldVal) {
            console.log(newVal)
        }
    }
})
```

### Computed

计算属性，data 如果需要进行复杂计算，放到 computed 里面比较好。计算属性的求职结果会被缓存起来方便下次调用
