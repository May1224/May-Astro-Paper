# AstroMay 写作与图片规范

## 新建文章

文章保存在 `src/content/posts/`，文件名会成为文章 URL。推荐使用英文小写和连字符，例如：

```text
src/content/posts/javascript-event-loop.md
```

基础 frontmatter：

```yaml
---
author: AstroMay
pubDatetime: 2026-06-23T12:00:00+08:00
title: "文章标题"
tags:
  - 前端
  - JavaScript
cover: ../../assets/images/posts/javascript-event-loop/cover.webp
coverAlt: 展示事件循环中任务队列关系的插画
description: 用一到两句话说明文章解决的问题和主要内容。
---
```

有封面时必须填写 `coverAlt`。文章有实质更新时增加或修改 `modDatetime`；需要在首页重点展示时设置 `featured: true`。

## 本地图片

每篇文章的图片统一放在：

```text
src/assets/images/posts/<文章文件名>/
```

正文图片使用相对路径：

```markdown
![准确描述图片内容](../../assets/images/posts/javascript-event-loop/event-loop.webp)
```

需要图注时使用 Markdown 图片标题：

```markdown
![事件循环执行顺序](../../assets/images/posts/javascript-event-loop/event-loop.webp "宏任务与微任务的执行关系")
```

构建时会自动生成响应式图片；正文图片支持点击放大、键盘打开和 Escape 关闭。

## 内容结构

- 页面标题由 frontmatter 的 `title` 生成，正文从二级标题 `##` 开始。
- 主要章节使用 `##`，章节内部问题使用 `###`。
- 代码块必须标明语言；只展示关键片段时说明省略内容。
- 外部资料使用链接和自己的总结，不复制大段原文。
- 发布前运行 `pnpm run build`，确认内容校验、路由和搜索索引全部通过。
