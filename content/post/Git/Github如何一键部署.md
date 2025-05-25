---
title: Github如何一键部署
slug: Git-2
date: 2025-03-03 00:00:00+0800
categories:
    - Git
tags:
    - Git
---

> 由于最近一直更新博客（小骄傲），但是发现每次部署，都要博客仓库打包后，手动复制到网页仓库发布，很麻烦，所以研究一下有没有什么自动化部署的工具

需要在源码仓库根目录创建.github/workflows/deploy.yml文件，然后配置
```yml
name: Deploy Hugo
on:
  push:
    branches: [main]  # 触发分支（源码分支）
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: 拉取代码
        uses: actions/checkout@v4
        with:
          submodules: true  # 如果用了主题子模块必加

      - name: 安装 Hugo
        run: sudo snap install hugo

      - name: 生成静态文件
        run: hugo --minify

      - name: 部署到 GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          # 从默认的 GITHUB_TOKEN 改为自己的 Personal Token
          personal_token: ${{ secrets.PERSONAL_TOKEN }}  
          # 指定目标仓库（格式：用户名/仓库名）
          external_repository: CrownJoker07/CrownJoker07.github.io
          publish_dir: ./public
          # 强制目标分支为 main
          publish_branch: main
          # 添加以下参数解决历史提交冲突
          force_orphan: true构建目录
```

**secrets.PERSONAL_TOKEN**需要在源码仓库的**Settings/Secrets and Variables/Actions**创建Secrets，名字叫PERSONAL_TOKEN，内容是 GitHub账号**Settings/Developer Settings/Personal access tokens (classic)**的具有工作流权限的密令


配置好后，试试推送，就会发现已经触发Github Action.