---
author: AstroMay
pubDatetime: 2026-06-22T20:00:00+08:00
modDatetime: 2026-06-23T11:40:00+08:00
title: "博客上线记录：从 AstroPaper 到 AstroMay"
tags:
  - 建站
  - Astro
  - GitHub Pages
cover: ../../assets/images/posts/first-diary/cover.webp
coverAlt: 从 Markdown 写作、Git 版本管理到静态网站发布的流程插画
description: 记录 AstroMay 从模板初始化、中文化到 GitHub Pages 自动部署的完整建站过程。
---

AstroMay 的第一版已经可以公开访问。这篇文章记录为什么选择静态博客、目前采用的技术方案，以及后续如何持续更新。

## 为什么选择静态博客

当前的主要需求是发布学习笔记、技术文章和阶段性记录，不需要用户登录、数据库或后台业务系统。静态博客更适合这个阶段：

- 文章直接使用 Markdown 管理，内容和代码都能进入版本控制。
- 构建结果只有 HTML、CSS 和少量 JavaScript，部署简单，访问速度稳定。
- 不维护数据库和服务器，减少长期维护成本。
- 每次修改都有 Git 记录，出现问题时容易定位和回退。

## 当前技术方案

网站以 AstroPaper 为基础，使用 Astro 6 和 Tailwind CSS 4。内容保存在 `src/content/posts/`，通过 Astro Content Collections 校验文章元信息。

发布流程保持为一条清晰的链路：

1. 在本地编写或修改 Markdown。
2. 运行 `pnpm run build` 检查类型、路由和搜索索引。
3. 将修改提交并推送到 GitHub。
4. GitHub Actions 自动构建并发布到 GitHub Pages。

这种方式没有额外的管理后台，但每一步都透明、可检查，也适合逐步学习静态网站工程化。

## 已完成的调整

- 全站界面、搜索提示和页面元信息改为中文。
- 增加日记、学习、标签、归档和 Pagefind 站内搜索。
- 适配 GitHub Pages 的 `/May-Astro-Paper/` 子路径。
- 增加文章封面、阅读时长、目录、相关文章和图片灯箱。
- 使用 GitHub Actions 在每次推送后自动部署。

## 内容边界

公开仓库中的文章默认对所有人可见，因此这里只发布适合公开的技术内容和个人记录。账号、密钥、私人对话以及其他敏感信息不会提交到仓库，也不会依赖“没有入口链接”进行隐藏。

## 下一步

后续会优先积累真实内容，而不是继续堆叠功能：

- 把零散的前端复习资料整理成结构稳定的文章。
- 对做过的项目记录背景、实现、问题和复盘。
- 为重要文章补充示意图、截图和可复现步骤。
- 内容积累到一定数量后，再增加项目展示页和专题系列。
