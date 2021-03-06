# wwto [![Build Status][travis-image]][travis-url] [![license][license-image]][license-url] [![javascript style guide][standard-image]][standard-url] [![version][version-image]][version-url]
<!-- [![Coverage Status][coveralls-image]][coveralls-url] -->

[travis-url]: https://www.travis-ci.org
[travis-image]: https://www.travis-ci.org/WangJuYan/wjyTest.svg?branch=master
[coveralls-url]: https://coveralls.io
[coveralls-image]: https://coveralls.io/repos/github/WangJuYan/wjyTest/badge.svg?branch=master
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: demo/miniprogram-demo/LICENSE
[version-image]: https://img.shields.io/badge/version-v2.0.10-blue.svg
[version-url]: README.md

> **wwto**: wuba wechat mini-program to other mini-program

## 简介

**wwto**是一款支持将原生微信小程序转换成其他小程序的工具集合。  
使用**wwto**，几乎不需要对已有的微信小程序做任何改动，可以接近零成本获得`百度小程序`、`支付宝小程序`、`头条小程序`。

## 前提

- node >= 8.9.3
- gulp <= 3.9.1

## 安装

```shell
  npm i wwto -g

  #or
  yarn global add wwto
```

## 使用

**注意：**如果包含插件，请将插件的源码拷贝到：`src/plugins/xxx`目录下，`xxx`为被调用插件名称。

### 命令行

```shell
  # 查看帮助
  wwto --help
  # 查看转换命令使用说明
  wwto build --help
  # 查看源码兼容性检测使用说明
  wwto lint --help
  # 查看版本号
  wwto -v

  # 转换成百度小程序
  wwto build -p baidu -s src -t dist/baidu
  # 检测源码对百度小程序的兼容性
  wwto lint -p baidu -s src
  
  # 转换成支付宝小程序
  wwto build -p alibaba -s src -t dist/alibaba
  # 检测源码对支付宝小程序的兼容性
  wwto lint -p alibaba -s src
  
  # 转换成头条小程序
  wwto build -p toutiao -s src -t dist/toutiao
  # 检测源码对头条小程序的兼容性
  wwto lint -p toutiao -s src
  
  # 转换成百度&&支付宝&&头条小程序
  wwto build -s src -t dist
  # 检测源码对百度&&支付宝&&头条小程序的兼容性
  wwto lint -s src
  
  # 转换插件调用方式（提供给wbmp使用，原生微信小程序转换已集成到build命令）
  wwto plugin -s dist/baidu
```

### 启动项目

```shell
  npm install
  # 安装依赖

  npm run build
  # 构建项目

  npm run dev
  # 运行项目

  jest --coverage
  # 检测单元测试覆盖率
```

### 打包工具

```javascript
const gulp = require('gulp');
const wwto = require('wwto');

// 转换成百度/支付宝/头条小程序
gulp.task('build', function(cb) {
    wwto.toAll({
      source: './src',
      baiduTarget: './dist/baidu',
      alibabaTarget: './dist/alibaba',
      toutiaoTarget: './dist/toutiao',
    });
});

// 检测源码对各平台的兼容性
gulp.task('lint', function(cb) {
    wwto.lintAll({
      source: './src'
    });
});
```

## 注意事项

注意事项是各平台不支持且无法通过本工具转换完成的一些点，如果要开发跨平台的应用需要规避或者降级处理。

### 百度小程序

- bind*={{str}} `str`只能是函数名（字符串），不能包含表达式计算（如：`bindtap="flag ? 'fn1' : 'fn2'"`）
- wx:for={{arr}}  `arr`只能是变量名（字符串），不能包含表达式计算（如：`wx:for="{{flag ? arr1 : arr2}}"`）
- 在同一个标签上，`wx:for`和`wx:if`不能同时使用
- wxml不支持`hidden`
- 通过`properties`绑定的数据，在子组件更新后**不会**同步到父组件（重要）
- 图片的`src`属性不能用数组赋值（如：`<image src="{{arr}}"></image>`）
- 不要使用`setData`保存视图不需要的变量（如原生变量：`Animation`），继承字段会被丢弃

### 头条小程序

- 不支持组件（如：`movable-area`、`movable-view`、`cover-view`、`cover-image`、`map`、`audio`、`canmera`等）
- `websocket`不能使用全局事件（如：`wx.onSocketOpen`）
- 录音功能没有全局方法（`wx.startRecord`, `wx.stopRecord`）
- 不支持背景音频
- 不支持实时音视频通话
- 条件/循环渲染，不能进行函数调用运算（如：`wx:if="{{['aa', 'bb'].indexOf('aa')===-1}}"`）
- 图片的`src`属性不能用数组赋值（如：`<image src="{{arr}}"></image>`）
- `wx:for`不支持对象，从源码规避（转换一下）
- 不支持`selectComponent`，可以通过监听属性的`observer`来实现外部的调用
- 自定义组件不能响应事件（如：`bindTap`），需要添加一层容器来捕获事件

### 支付宝小程序

- `json`文件或模板绝对路径必须以`/`开头，相对路径必须以./开头
- 自定义组件命名只能使用短横线（custom-com）
- `fetch`是全局只读对象，不能对其赋值
- `require`，参数只能是字符串直接量，不能是变量（如：`var path = '/a/b/c'; require(path);`）
- `triggerEvent(name, data)`，`name`目前只支持字符串直接量，不支持变量
- `swiper`组件手动设置`current`后，不会自动触发`bindChange`事件，如果需要主动触发
- 只能存在一个`websocket`连接
- 组件样式不是隔离的，父子组件之间class不要重复
- 自定义组件不能响应事件（如：`bindTap`），需要添加一层容器来捕获事件
- 唤起键盘不会上推position:fixed的元素
- 文件名不能包含'@'字符

## 贡献

欢迎参与 wwto 项目的开发建设和讨论。
> 提交 pull request 之前请先提 [Issue 讨论].
