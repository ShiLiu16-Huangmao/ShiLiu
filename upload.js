/* ========================================
   猫咪相册 — 上传脚本
   通过 GitHub REST API 上传图片并更新相册
   ======================================== */

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewList = document.getElementById('previewList');
const uploadActions = document.getElementById('uploadActions');
const btnUpload = document.getElementById('btnUpload');
const progressWrap = document.getElementById('progressWrap');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultCard = document.getElementById('resultCard');
const resultDesc = document.getElementById('resultDesc');
const noticeCard = document.getElementById('noticeCard');
const toast = document.getElementById('toast');

let selectedFiles = [];

/* ========== 配置校验 ========== */
const cfg = window.UPLOAD_CONFIG;
if (!cfg || !cfg.token || cfg.token === 'ghp_xxxxxxxxxxxxxxxxxxxx') {
  noticeCard.style.display = 'block';
  noticeCard.innerHTML = `
    <strong>⚠️ 未配置 GitHub Token</strong>
    请复制 <code>config.example.js</code> 为 <code>config.js</code>，
    然后填入你的 GitHub Token、用户名和仓库名。
  `;
  noticeCard.style.background = '#fce4ec';
  noticeCard.style.borderColor = '#f5c6d0';
  noticeCard.style.color = '#c62828';
} else {
  noticeCard.style.display = 'none';
}

/* ========== 文件选择 ========== */
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
  fileInput.value = '';
});

/* 拖放支持 */
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
  if (!files || !files.length) return;

  const valid = [];
  for (const f of files) {
    if (!f.type.startsWith('image/')) {
      showToast('跳过了非图片文件：' + f.name, 'error');
      continue;
    }
    if (f.size > 50 * 1024 * 1024) {
      showToast('文件过大（最大 50MB）：' + f.name, 'error');
      continue;
    }
    valid.push(f);
  }

  if (!valid.length) return;

  selectedFiles = selectedFiles.concat(valid);
  renderPreview();
}

/* ========== 预览渲染 ========== */
function renderPreview() {
  previewList.innerHTML = '';
  uploadActions.style.display = selectedFiles.length ? '' : 'none';
  resultCard.style.display = 'none';

  selectedFiles.forEach((file, i) => {
    const url = URL.createObjectURL(file);
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const today = new Date().toISOString().slice(0, 10);
    const safeName = baseName.replace(/[^\w一-鿿\-_]/g, ' ').trim() || '猫咪';

    const item = document.createElement('div');
    item.className = 'preview-item';
    item.innerHTML = `
      <img class="preview-thumb" src="${url}" alt="">
      <div class="preview-info">
        <div class="preview-field">
          <label>猫咪名字</label>
          <input type="text" class="input-name" value="${escHtml(safeName)}">
        </div>
        <div class="preview-field">
          <label>拍摄日期</label>
          <input type="date" class="input-date" value="${today}">
        </div>
      </div>
      <button class="preview-remove" data-index="${i}" aria-label="移除">✕</button>
    `;
    previewList.appendChild(item);
  });

  // 移除按钮事件
  previewList.querySelectorAll('.preview-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'));
      selectedFiles.splice(idx, 1);
      renderPreview();
    });
  });
}

/* ========== 上传 ========== */
btnUpload.addEventListener('click', startUpload);

async function startUpload() {
  if (!cfg || !cfg.token || cfg.token === 'ghp_xxxxxxxxxxxxxxxxxxxx') {
    showToast('请先配置 GitHub Token', 'error');
    return;
  }

  const total = selectedFiles.length;
  if (!total) return;

  btnUpload.disabled = true;
  progressWrap.classList.add('active');
  resultCard.style.display = 'none';
  updateProgress(0, `准备上传 ${total} 张照片…`);

  const api = githubAPI();
  const uploaded = [];
  let failed = 0;

  for (let i = 0; i < total; i++) {
    const file = selectedFiles[i];
    const itemEl = previewList.children[i];
    const nameInput = itemEl ? itemEl.querySelector('.input-name') : null;
    const dateInput = itemEl ? itemEl.querySelector('.input-date') : null;

    const catName = nameInput ? nameInput.value.trim() || '猫咪' : '猫咪';
    const catDate = dateInput ? dateInput.value || todayStr() : todayStr();

    updateProgress(
      Math.floor((i / total) * 80),
      `上传中 (${i + 1}/${total})：${file.name}`
    );

    try {
      const fileName = generateFileName(file);
      const path = `images/${fileName}`;
      const content = await fileToBase64(file);

      await api.uploadFile(path, content, `上传 ${catName} 的照片`);

      uploaded.push({
        file: path,
        date: catDate,
        name: catName
      });
    } catch (err) {
      failed++;
      showToast(`上传失败：${file.name} — ${err.message}`, 'error');
    }
  }

  if (!uploaded.length) {
    updateProgress(0, '');
    progressWrap.classList.remove('active');
    btnUpload.disabled = false;
    showToast('没有照片上传成功，请重试', 'error');
    return;
  }

  // 更新 photos.json
  updateProgress(85, '正在更新相册数据…');
  try {
    await updatePhotosJson(api, uploaded);
  } catch (err) {
    showToast(`相册数据更新失败：${err.message}`, 'error');
  }

  // 触发 Pages 部署
  updateProgress(95, '正在触发页面部署…');
  try {
    await api.triggerPagesBuild();
  } catch (err) {
    // Pages 部署触发失败不阻塞流程
  }

  updateProgress(100, '完成！');
  progressWrap.classList.remove('active');
  btnUpload.disabled = false;

  // 显示结果
  const names = uploaded.map(p => p.name).join('、');
  resultDesc.textContent = `成功上传 ${uploaded.length} 张照片${failed ? `，${failed} 张失败` : ''}：${names}`;
  resultCard.style.display = 'block';
  uploadActions.style.display = 'none';
  previewList.innerHTML = '';
  selectedFiles = [];
  resultCard.scrollIntoView({ behavior: 'smooth' });

  if (failed) {
    showToast(`${uploaded.length} 张成功，${failed} 张失败`, 'error');
  } else {
    showToast('全部上传成功！', 'success');
  }
}

/* ========== 更新 photos.json ========== */
async function updatePhotosJson(api, newPhotos) {
  let current = [];
  let sha = null;

  try {
    const resp = await api.getFile('photos.json');
    current = JSON.parse(resp.content);
    sha = resp.sha;
  } catch (err) {
    // photos.json 可能不存在，新建
    if (err.status !== 404) throw err;
  }

  const merged = current.concat(newPhotos);
  const jsonStr = JSON.stringify(merged, null, 2);
  await api.uploadFile('photos.json', strToBase64(jsonStr), '更新相册数据', sha);
}

/* ========== GitHub API 封装 ========== */
function githubAPI() {
  const { token, owner, repo, branch } = cfg;
  const base = `https://api.github.com/repos/${owner}/${repo}`;

  async function request(method, path, body) {
    const headers = {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    };

    const opts = { method, headers };
    if (body) {
      headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }

    const resp = await fetch(`${base}${path}`, opts);

    if (!resp.ok) {
      const err = new Error(`GitHub API 错误 (${resp.status})`);
      err.status = resp.status;
      try {
        const data = await resp.json();
        err.message = data.message || err.message;
      } catch (_) {}
      throw err;
    }

    if (resp.status === 204) return null;
    return resp.json();
  }

  return {
    /* 上传/创建文件 */
    uploadFile(filePath, contentBase64, message, sha) {
      const body = {
        message,
        content: contentBase64,
        branch
      };
      if (sha) body.sha = sha;
      return request('PUT', `/contents/${filePath}`, body);
    },

    /* 获取文件内容（含 SHA） */
    async getFile(filePath) {
      const data = await request('GET', `/contents/${filePath}?ref=${branch}`);
      return {
        content: decodeBase64(data.content),
        sha: data.sha
      };
    },

    /* 触发 Pages 构建 */
    triggerPagesBuild() {
      return request('POST', '/pages/builds');
    }
  };
}

function decodeBase64(str) {
  const bin = atob(str.replace(/\s/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}

/* ========== 工具函数 ========== */
function strToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // 去掉 data:image/...;base64, 前缀
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });
}

function generateFileName(file) {
  const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 6);
  return `cat-${ts}-${rand}.${ext}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function updateProgress(pct, text) {
  progressFill.style.width = pct + '%';
  progressText.textContent = text;
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = 'toast toast-' + type + ' show';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
