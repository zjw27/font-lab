# Font Lab 字体实验场

一个在浏览器中快速预览和比较本机字体的本地工具，适合漫画汉化、排版和字体筛选。

## 功能

- 通过 Chrome Local Font Access API 读取本机字体
- 浏览器不支持或未授权时自动使用模拟字体
- 实时同步预览文字
- 搜索字体名称
- 调整字号、字重、字距、行距、文字颜色和背景色
- 横排与三列方形竖排预览
- 分批懒加载大量字体
- 常用字体、收藏字体与最近使用
- 一键复制字体名称
- 常用、收藏和最近使用记录保存在浏览器本地

## 本地运行

需要 Node.js 22.13 或更高版本，以及最新版 Chrome 或其他支持 Local Font Access API 的 Chromium 浏览器。

```bash
npm install
npm run dev
```

打开终端显示的本地地址，并允许浏览器访问本机字体。

## 构建

```bash
npm run build
```

## 技术栈

- React
- TypeScript
- Vite / vinext
- 原生 CSS

本项目不上传或收集字体文件；字体信息只在当前浏览器中读取和使用。
