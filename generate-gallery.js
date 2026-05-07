/* ========================================
   猫咪相册 — 相册数据生成器
   扫描 images/ 目录，生成/更新 photos.json
   由 GitHub Actions 在每次 push 时自动执行
   ======================================== */

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'images');
const OUTPUT_FILE = path.join(__dirname, 'photos.json');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg']);

function isImage(file) {
  return IMAGE_EXTS.has(path.extname(file).toLowerCase());
}

/** 从文件名推断猫咪名字 */
function guessName(file) {
  const base = path.basename(file, path.extname(file));
  // 去掉常见前缀/分隔符
  const cleaned = base
    .replace(/^(cat|img|image|photo|pic)[-_]/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\d{8,14}/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || '猫咪';
}

/** 尝试从文件名提取日期 */
function guessDate(file, stat) {
  const base = path.basename(file);
  // 匹配 YYYY-MM-DD 或 YYYYMMDD
  const m1 = base.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m1) return `${m1[1]}-${m1[2]}-${m1[3]}`;
  const m2 = base.match(/(\d{4})(\d{2})(\d{2})/);
  if (m2) return `${m2[1]}-${m2[2]}-${m2[3]}`;
  // fallback: 文件修改时间
  return stat.mtime.toISOString().slice(0, 10);
}

function main() {
  // 1. 读取现有 photos.json
  let existing = [];
  try {
    existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  } catch (_) {
    // 不存在则从空开始
  }

  // 2. 建立旧数据索引：file → { date, name }
  const oldMap = new Map();
  for (const entry of existing) {
    oldMap.set(entry.file, entry);
  }

  // 3. 扫描 images/ 目录
  let imageFiles = [];
  try {
    imageFiles = fs.readdirSync(IMAGES_DIR).filter(isImage);
  } catch (_) {
    // images/ 目录不存在
  }

  // 4. 生成新数据：保留已有元数据，新文件自动推断
  const photos = imageFiles.map((file) => {
    const filePath = `images/${file}`;
    const cached = oldMap.get(filePath);
    if (cached) return cached;

    // 新文件：自动生成元数据
    const stat = fs.statSync(path.join(IMAGES_DIR, file));
    return {
      file: filePath,
      date: guessDate(file, stat),
      name: guessName(file)
    };
  });

  // 按日期排序（新→旧）
  photos.sort((a, b) => b.date.localeCompare(a.date));

  // 5. 写入
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(photos, null, 2) + '\n', 'utf-8');

  // 6. 输出摘要
  const added = photos.length - existing.length;
  const removed = existing.length - photos.length;
  const parts = [`共 ${photos.length} 张照片`];
  if (added > 0) parts.push(`新增 ${added} 张`);
  if (removed > 0) parts.push(`移除 ${removed} 张`);
  if (added <= 0 && removed <= 0) parts.push('无变化');
  console.log(parts.join('，'));
}

main();
