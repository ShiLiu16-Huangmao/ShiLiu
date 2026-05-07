/* ========================================
   猫咪相册 — 微信推送通知
   支持 PushPlus / Server酱，由 GitHub Actions 调用
   ======================================== */

const https = require('https');
const fs = require('fs');
const path = require('path');

/* ========== 读取环境变量 ========== */
const PUSHPLUS_TOKEN = process.env.PUSHPLUS_TOKEN || '';
const SERVERCHAN_SENDKEY = process.env.SERVERCHAN_SENDKEY || '';
const SITE_URL = process.env.SITE_URL || 'https://example.com';
const NEW_COUNT = parseInt(process.env.NEW_COUNT || '0', 10);

/* ========== 读取最新照片信息 ========== */
function readLatestPhotos(count) {
  const photosPath = path.join(__dirname, 'photos.json');
  let photos = [];
  try {
    photos = JSON.parse(fs.readFileSync(photosPath, 'utf-8'));
  } catch (_) {
    return [];
  }
  // photos.json 已按日期倒序（新→旧），取前 count 条
  return photos.slice(0, count || photos.length);
}

/* ========== 格式化消息内容 ========== */
function buildMessage(latestPhotos, siteUrl) {
  const lines = ['🐱 <b>有新的猫咪照片啦！</b>', ''];

  for (const p of latestPhotos) {
    const name = p.name || '猫咪';
    const date = p.date || '';
    lines.push(`  • ${name}  ${date}`);
  }

  lines.push('');
  lines.push(`👉 <a href="${siteUrl}">点击查看相册</a>`);

  return lines.join('\n');
}

/* ========== HTTP POST 封装 ========== */
function httpPost(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const opts = {
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 15000
    };

    const req = https.request(opts, (res) => {
      let buf = '';
      res.on('data', (chunk) => buf += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(buf);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${buf}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('请求超时')); });
    req.write(body);
    req.end();
  });
}

/* ========== PushPlus 推送 ========== */
async function sendPushPlus(token, title, content) {
  const resp = await httpPost('https://www.pushplus.plus/send', {
    token,
    title,
    content,
    template: 'html'
  });
  const data = JSON.parse(resp);
  if (data.code !== 200) {
    throw new Error(`PushPlus 返回错误：${data.msg || resp}`);
  }
  console.log('PushPlus 发送成功');
}

/* ========== Server酱 推送 ========== */
async function sendServerChan(sendkey, title, content) {
  const url = `https://sctapi.ftqq.com/${sendkey}.send`;
  const resp = await httpPost(url, {
    title,
    desp: content.replace(/<[^>]+>/g, '')  // Server酱不支持 HTML
  });
  const data = JSON.parse(resp);
  if (data.code !== 0) {
    throw new Error(`Server酱返回错误：${data.message || resp}`);
  }
  console.log('Server酱发送成功');
}

/* ========== 主流程 ========== */
async function main() {
  // 没有新照片则跳过
  if (NEW_COUNT <= 0) {
    console.log('没有新增照片，跳过通知');
    return;
  }

  // 检查是否配置了推送服务
  if (!PUSHPLUS_TOKEN && !SERVERCHAN_SENDKEY) {
    console.log('未配置推送服务（PUSHPLUS_TOKEN / SERVERCHAN_SENDKEY），跳过通知');
    return;
  }

  const latestPhotos = readLatestPhotos(NEW_COUNT);
  if (!latestPhotos.length) {
    console.log('未找到照片数据，跳过通知');
    return;
  }

  const title = `猫咪相册 · 新增 ${latestPhotos.length} 张照片`;
  const content = buildMessage(latestPhotos, SITE_URL);

  console.log(`准备发送通知：${title}`);
  console.log(`新增 ${latestPhotos.length} 张：${latestPhotos.map(p => p.name).join('、')}`);

  // 优先使用 PushPlus，其次 Server酱
  if (PUSHPLUS_TOKEN) {
    await sendPushPlus(PUSHPLUS_TOKEN, title, content);
  } else if (SERVERCHAN_SENDKEY) {
    await sendServerChan(SERVERCHAN_SENDKEY, title, content);
  }
}

main().catch((err) => {
  console.error('发送通知失败：', err.message);
  // 不中断 CI，通知失败不是致命错误
});
