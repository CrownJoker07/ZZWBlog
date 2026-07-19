# ZZWBlog

ZZWBlog 是一个使用 [Hugo](https://gohugo.io/) 构建的个人技术博客，采用仓库内置的 [Hugo Theme Stack](https://github.com/CaiJimmy/hugo-theme-stack) 主题。

## 环境依赖

- [Git](https://git-scm.com/)
- Hugo Extended 0.123.0 或更高版本

主题已包含在仓库中，不需要初始化 Git submodule，也不需要安装 Node.js、npm 或 Go。

### 安装 Hugo Extended

macOS 或已安装 Homebrew 的 Linux：

```bash
brew install hugo
```

Windows：

```powershell
winget install Hugo.Hugo.Extended
```

支持 Snap 的 Linux：

```bash
sudo snap install hugo
```

其他安装方式请参考 [Hugo 官方安装文档](https://gohugo.io/installation/)。安装完成后，检查版本信息：

```bash
hugo version
```

输出中应包含 `extended`，且版本不低于 `0.123.0`。

## 本地运行

克隆仓库并进入项目目录：

```bash
git clone git@github.com:CrownJoker07/ZZWBlog.git
cd ZZWBlog
```

启动本地开发服务器（包含草稿内容）：

```bash
hugo server -D
```

然后访问 <http://localhost:1313/>。开发服务器会监听文件变化并自动重新构建页面。

## 构建

生成用于发布的静态文件：

```bash
hugo --minify
```

构建结果位于 `public/` 目录。

## 项目结构

```text
.
├── archetypes/  # 新内容的模板
├── assets/      # 由 Hugo 处理的图片、图标等资源
├── content/     # 页面和文章内容
├── layouts/     # 项目自定义模板与短代码
├── static/      # 直接复制到站点的静态资源
├── themes/      # Hugo Theme Stack 主题源码
└── hugo.toml    # 站点配置
```

## 部署

仓库已有 GitHub Actions 部署流程。代码推送到 `main` 分支后，工作流会执行 `hugo --minify`，再将 `public/` 发布到 `CrownJoker07/CrownJoker07.github.io` 仓库的 `main` 分支。

自动部署依赖仓库 Actions Secrets 中配置的 `PERSONAL_TOKEN`。
