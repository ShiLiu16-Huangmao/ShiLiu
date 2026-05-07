// ==========================================
// 上传配置 — 复制为 config.js 并填入你的信息
// ==========================================
// 警告：config.js 包含 GitHub Token，请勿提交到 Git！
// 已在 .gitignore 中忽略 config.js
// ==========================================

window.UPLOAD_CONFIG = {
  // ---------- GitHub 配置 ----------

  // GitHub Personal Access Token（需要 repo 权限）
  token: 'ghp_xxxxxxxxxxxxxxxxxxxx',

  // GitHub 用户名
  owner: 'your-username',

  // 仓库名
  repo: 'your-repo-name',

  // 分支名（通常是 main 或 master）
  branch: 'main',

  // ---------- 网站地址 ----------
  // 你的 GitHub Pages 地址（用于通知消息中的链接）
  siteUrl: 'https://your-username.github.io/your-repo-name'
};

// ==========================================
// 微信推送通知配置
// ==========================================
// 以下 Token 在 GitHub Actions 中使用，不在浏览器端生效。
// 请在 GitHub 仓库的 Settings → Secrets and variables → Actions
// 中添加对应的 Secrets。
//
//   Secret 名称             用途
//   ─────────────────────────────────────
//   PUSHPLUS_TOKEN          PushPlus 推送 Token
//   SERVERCHAN_SENDKEY      Server酱 SendKey
//   SITE_URL                网站地址（可选，默认取 config.js 中的值）
//
// 详细教程见 README.md
// ==========================================
