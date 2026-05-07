<p align="center">
  <h1 align="center">🐱 猫咪相册</h1>
  <p align="center">
    拍照 → 上传 → 自动部署 → 微信提醒
    <br>
    一行代码都不用写，就能拥有自己的猫咪照片网站
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/部署-GitHub%20Pages-blue" alt="Pages">
  <img src="https://img.shields.io/badge/自动化-GitHub%20Actions-2088FF" alt="Actions">
  <img src="https://img.shields.io/badge/微信通知-PushPlus%20%7C%20Server酱-green" alt="WeChat">
  <img src="https://img.shields.io/badge/平台-手机%20%7C%20电脑-lightgrey" alt="Platform">
</p>

---

## 📖 目录

- [项目介绍](#-项目介绍)
- [快速开始](#-快速开始)
- [本地运行](#-本地运行)
- [GitHub Pages 部署](#-github-pages-部署)
- [上传图片（电脑端）](#-上传图片电脑端)
- [上传图片（手机端）](#-上传图片手机端)
- [微信提醒](#-微信提醒)
- [配置说明](#-配置说明)
- [常见问题](#-常见问题)
- [项目结构](#-项目结构)
- [后续扩展建议](#-后续扩展建议)

---

## 🎨 项目介绍

**猫咪相册**是一个零成本、零维护的个人照片展示网站。

### 它长什么样

- 📱 **手机优先**：瀑布流布局，手指滑动浏览
- 🖼️ **灯箱大图**：点击照片全屏查看，支持左右滑动
- ⚡ **懒加载**：滚动到才加载，省流量
- 🍎 **苹果风格**：极简白底设计，和 iOS 相册一样自然

### 它能做什么

```
你只需要拍照
     ↓
上传到仓库（手机 / 电脑都可以）
     ↓
网站自动更新              ←  GitHub Actions
微信收到通知              ←  PushPlus / Server酱
     ↓
打开网站就能看到新照片
```

### 为什么选它

| | 传统建站 | 猫咪相册 |
|--|---------|----------|
| 服务器 | 需要买 | ❌ 不需要（GitHub Pages 免费） |
| 域名 | 需要买 | ❌ 不需要（`xxx.github.io` 免费用） |
| 数据库 | 需要配 | ❌ 不需要（一个 JSON 文件搞定） |
| 写代码 | 需要 | ❌ 不需要 |
| 上传方式 | FTP / 后台 | 手机 App / 浏览器 |
| 微信通知 | 需要开发 | ✅ 配置即可 |
| 月费 | $5-$50 | $0 |

---

## 🚀 快速开始

一共 3 步，大约 5 分钟。

### 第 1 步：复制仓库

```bash
# 把代码下载到本地
git clone https://github.com/你的用户名/猫咪相册.git
cd 猫咪相册
```

或者直接在 GitHub 网页上点 **Fork**，复制一份到你自己的账号下。

### 第 2 步：创建配置文件

```bash
cp config.example.js config.js
```

用任意文本编辑器打开 `config.js`，填入你的信息：

```js
window.UPLOAD_CONFIG = {
  token: 'ghp_你的GitHub令牌',        // 后面会教你怎么获取
  owner: '你的GitHub用户名',          // 比如 xiaoming
  repo: '仓库名',                     // 比如 cat-gallery
  branch: 'main',
  siteUrl: 'https://用户名.github.io/仓库名'
};
```

### 第 3 步：开启 GitHub Pages

1. 打开仓库的 **Settings** → **Pages**
2. **Source** 选择 **GitHub Actions**
3. 保存

> 然后把代码推送到 GitHub，一切就绪。

---

## 💻 本地运行

如果你想在本地预览网站效果：

```bash
# 进入项目目录
cd 猫咪相册

# 用任意 HTTP 服务启动（任选一种）
python -m http.server 8080     # Python 3
npx serve .                    # Node.js
```

浏览器打开 `http://localhost:8080` 即可看到相册。

> 本地运行时 `upload.html` 的上传功能不可用（因为需要 GitHub Token），但浏览相册功能正常。

---

## 🌐 GitHub Pages 部署

### 开启方式

| 步骤 | 操作 |
|------|------|
| ① | 打开仓库 → **Settings** |
| ② | 左侧菜单 → **Pages** |
| ③ | **Source** 下拉 → 选 **GitHub Actions** |
| ④ | 点 **Save** |

### 如何触发部署

| 方式 | 触发条件 |
|------|----------|
| 推送代码 | 往 `main` 分支 push 任何文件 |
| 上传照片 | `upload.html` 上传 → 自动 push |
| App 上传 | PicHoro / PicPlus 上传 → 自动 push |
| 手动触发 | Actions → 部署猫咪相册 → Run workflow |

### 查看部署状态

1. 打开仓库 → **Actions** 标签
2. 看到 `✅ 部署猫咪相册` 就是部署成功
3. 如果是 `❌`，点进去看红色步骤的错误信息

### 网站地址

部署成功后，网站地址是：

```
https://你的用户名.github.io/仓库名
```

例如：`https://xiaoming.github.io/cat-gallery`

---

## 🖥️ 上传图片（电脑端）

### 打开上传页面

用浏览器打开项目里的 `upload.html`。

> 可以直接双击打开，不需要本地服务器。

### 选择照片

- 🖱️ **点击虚线框** → 打开文件选择器
- 🖱️ **拖放文件** → 把图片拖到虚线框里
- 支持 JPG / PNG / WebP
- 一次可以选多张

### 编辑信息

每张照片可以填写：

| 字段 | 说明 | 示例 |
|------|------|------|
| 猫咪名字 | 给照片起个名字 | 小花、团团 |
| 拍摄日期 | 自动填今天，可修改 | 2026-05-07 |

### 上传

1. 点击蓝色的 **上传到相册** 按钮
2. 等待进度条走完
3. 看到 `✅ 上传完成` 即可
4. 点「返回相册」查看效果

> 上传后等 1-2 分钟，GitHub Actions 会自动部署网站。如果配置了微信通知，手机会收到提醒。

### 获取 GitHub Token

第一次使用需要创建 Token：

1. 打开 https://github.com/settings/tokens
2. 点击 **Generate new token (classic)**
3. **Note** 写"猫咪相册"
4. **Expiration** 选"No expiration"
5. 勾选 ✅ **repo** 权限
6. 拉到最底点 **Generate token**
7. 🔑 复制 Token（`ghp_` 开头），粘贴到 `config.js` 里

> Token 只显示一次，记得保存到 `config.js` 和备忘录。

---

## 📱 上传图片（手机端）

不需要打开电脑，直接用手机 App 上传。

### 推荐 App

| App | 下载 | 适合 |
|-----|------|------|
| **PicHoro**（图床神器） | 酷安 / Google Play | Android |
| **PicPlus** | App Store / Google Play | iPhone / Android |

### 一次配置，永久使用

在 App 里填写：

```
图床类型：  GitHub
用户名：    你的GitHub用户名
仓库名：    你的仓库名
分支：      main
Token：     ghp_你的Token
存储路径：  images/
```

> 详细图文教程见 📖 **[docs/mobile-upload.md](docs/mobile-upload.md)**

### 日常使用

1. 📱 打开 App
2. 📸 拍照 / 选照片
3. ⬆️ 点上传
4. 🔄 等 1-2 分钟，网站自动更新

---

## 💬 微信提醒

上传新照片后，微信自动收到通知：

```
🐱 有新的猫咪照片啦！

  • 小花  2026-05-07
  • 团团  2026-05-07

👉 点击查看相册
```

### 选择推送服务（二选一）

| 服务 | 费用 | 获取方式 |
|------|------|----------|
| **PushPlus**（推荐） | 免费 | pushplus.plus 微信扫码 |
| **Server酱** | 免费 | sct.ftqq.com 微信扫码 |

### 配置步骤

**第 1 步**：获取 Token

- PushPlus → 打开 https://www.pushplus.plus → 微信扫码 → 一对一直送 → 复制 Token
- Server酱 → 打开 https://sct.ftqq.com → 微信扫码 → 复制 SendKey

**第 2 步**：添加到 GitHub

1. 打开仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 根据你选择的服务填写：

| Name | 值 |
|------|-----|
| `PUSHPLUS_TOKEN` | 你的 PushPlus Token |
| 或 `SERVERCHAN_SENDKEY` | 你的 Server酱 SendKey |

> 两个都配也行，优先用 PushPlus。

**第 3 步**：测试

1. 打开仓库 → **Actions** → **部署猫咪相册**
2. 点 **Run workflow** → **Run workflow**
3. 等完成后，微信应该收到消息

---

## ⚙️ 配置说明

### 所有配置项一览

```
config.js（本地文件，不提交到 Git）
├── token       GitHub Personal Access Token
├── owner       GitHub 用户名
├── repo        仓库名
├── branch      分支名（main / master）
└── siteUrl     网站地址


GitHub Secrets（在仓库 Settings 中配置）
├── PUSHPLUS_TOKEN       PushPlus 推送 Token
├── SERVERCHAN_SENDKEY   Server酱 SendKey
└── （可选）SITE_URL     网站地址覆盖


GitHub Pages Settings（仓库 Settings → Pages）
└── Source              GitHub Actions
```

### config.js 完整示例

```js
window.UPLOAD_CONFIG = {
  token: 'ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ12345',
  owner: 'xiaoming',
  repo: 'cat-gallery',
  branch: 'main',
  siteUrl: 'https://xiaoming.github.io/cat-gallery'
};
```

### Token 权限对照

| Token 类型 | 需要的权限 | 用途 |
|-----------|-----------|------|
| GitHub Personal Access Token (classic) | `repo` | upload.html 上传图片 |
| `GITHUB_TOKEN`（自动） | 无需配置 | GitHub Actions 部署网站 |
| PushPlus Token | — | 微信通知 |
| Server酱 SendKey | — | 微信通知 |

---

## ❓ 常见问题

<details>
<summary><b>上传成功但网站没更新？</b></summary>

等 1-2 分钟，GitHub Actions 需要时间执行。去仓库 Actions 标签确认「部署猫咪相册」是否 ✅。

如果 ❌ 了，点进去看看哪个步骤红色，对照错误信息排查。
</details>

<details>
<summary><b>Token 忘了/丢了怎么办？</b></summary>

GitHub Token 生成后只显示一次。丢了只能重新生成：

1. 打开 https://github.com/settings/tokens
2. 找到旧的 Token，点 **Delete**
3. 重新 **Generate new token**
4. 把新 Token 更新到 `config.js` 和手机 App 里
</details>

<details>
<summary><b>网站显示 404？</b></summary>

最常见的原因：

1. GitHub Pages 还没开启 → Settings → Pages → Source 选 GitHub Actions
2. 仓库是**私有的** → 免费账号的 Pages 要求仓库公开（public）
3. 还没执行过部署 → Actions → 手动触发一次
</details>

<details>
<summary><b>微信收不到通知？</b></summary>

逐项检查：

1. ✅ Secrets Name 是否完全一致（区分大小写）
2. ✅ PushPlus Token 是否在有效期
3. ✅ 是否关注了 PushPlus/Server酱 的公众号
4. ✅ Server酱 是否扫码登录了最新版（老版本已停用）
</details>

<details>
<summary><b>支持上传视频吗？</b></summary>

目前只支持图片。GitHub 单个文件限制 100MB，且 Pages 站点总体积建议不超过 1GB。需要视频支持可以看[后续扩展建议](#-后续扩展建议)。
</details>

<details>
<summary><b>能绑定自己的域名吗？</b></summary>

可以。在仓库 Settings → Pages → Custom domain 填入你的域名，然后去域名服务商添加 CNAME 记录指向 `你的用户名.github.io`。
</details>

<details>
<summary><b>config.js 不小心提交到 GitHub 了怎么办？</b></summary>

1. 立刻去 https://github.com/settings/tokens 删除这个 Token
2. 重新生成一个，更新 `config.js`
3. 从 Git 历史中移除：`git rm --cached config.js && git commit -m "移除 config.js"`
4. 确认 `.gitignore` 中有 `config.js`
</details>

---

## 📁 项目结构

```
猫咪相册/
│
├── 📄 index.html              相册首页
├── 📄 upload.html             照片上传页（电脑浏览器打开）
├── 🎨 style.css               全局样式（苹果风格）
├── 🖼️ gallery.js              相册前端脚本（瀑布流 + 灯箱）
├── ⬆️ upload.js                上传脚本（调用 GitHub API）
├── 🔧 generate-gallery.js     扫描 images/ → 生成 photos.json
├── 💬 send-notification.js    微信推送通知脚本
├── 📋 photos.json             照片元数据（自动维护）
├── ⚙️ config.example.js       配置模板
├── 🔒 config.js               你的配置（不提交到 Git）
├── 📁 images/                 照片存放目录
├── 📁 docs/
│   └── 📖 mobile-upload.md    手机上传详细教程
└── 📁 .github/workflows/
    └── 🤖 deploy.yml          GitHub Actions 自动部署
```

---

## 🔮 后续扩展建议

以下是一些可以继续折腾的方向，按难度排序：

### 零代码

- 🏷️ **自定义域名**：在 Pages 设置中绑定自己的域名
- 🎨 **换配色**：修改 `style.css` 开头的 CSS 变量，改成你喜欢的颜色
- 📝 **修改文案**：把页面中的"猫咪"改成"狗狗"/"花花"等
- 🌐 **SEO 优化**：在 `index.html` 的 `<title>` 和 `<meta>` 中加入描述

### 低代码

- 📹 **支持视频**：修改 `gallery.js` 和 `generate-gallery.js`，识别 `.mp4` 文件
- 🏷️ **照片标签**：在 `photos.json` 中加 `tags` 字段，页面上按标签筛选
- 📅 **按日期分组**：相册页按月份显示"2026年5月"分组标题
- 🔍 **搜索功能**：加一个搜索框，根据名字筛选照片
- 🌓 **深色模式**：加 `prefers-color-scheme: dark` 媒体查询

### 需要开发

- 📄 **分页加载**：照片多了以后用"加载更多"替代一次加载全部
- 🔒 **私人相册**：加简单的密码保护（纯前端验证）
- 📊 **访问统计**：接入 Google Analytics 或 Umami
- 🗂️ **多相册**：支持多个 `photos.json`，切换不同主题相册
- 🤖 **AI 识别**：接入 AI API 自动识别照片内容生成描述

---

## 📄 许可

MIT License — 自由使用，自由修改。
