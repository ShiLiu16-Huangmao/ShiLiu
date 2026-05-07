/* ========================================
   猫咪相册 — 首页脚本
   动态读取 photos.json，渲染瀑布流 + 灯箱
   ======================================== */

const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const btnClose = document.getElementById('lightbox-close');
const btnPrev = document.getElementById('lightbox-prev');
const btnNext = document.getElementById('lightbox-next');

let photos = [];
let currentIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

/* ========== 初始化 ========== */
init();

async function init() {
  try {
    const resp = await fetch('photos.json');
    if (!resp.ok) throw new Error('photos.json 加载失败');
    photos = await resp.json();

    if (!photos.length) {
      showEmpty();
      return;
    }

    renderGallery();
    bindLightboxEvents();
    observeLazyImages();
    bindKeyboard();
  } catch (err) {
    showEmpty();
  }
}

/* ========== 渲染图片网格 ========== */
function renderGallery() {
  gallery.innerHTML = '';

  photos.forEach((photo, i) => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.setAttribute('data-index', i);
    card.innerHTML = `
      <img
        class="gallery-card-img"
        data-src="${photo.file}"
        alt="${photo.name}"
      >
      <div class="gallery-card-info">
        <div class="gallery-card-name">${escHtml(photo.name)}</div>
        <div class="gallery-card-date">${escHtml(photo.date)}</div>
      </div>
    `;

    card.addEventListener('click', () => openLightbox(i));
    gallery.appendChild(card);
  });
}

/* ========== IntersectionObserver 懒加载 ========== */
function observeLazyImages() {
  if (!('IntersectionObserver' in window)) {
    // 降级：直接加载所有图片
    document.querySelectorAll('.gallery-card-img').forEach(img => loadImage(img));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadImage(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('.gallery-card-img').forEach(img => observer.observe(img));
}

function loadImage(img) {
  const src = img.getAttribute('data-src');
  if (!src || img.src) return;

  img.src = src;
  img.onload = () => img.classList.add('loaded');
  img.onerror = () => {
    img.src = 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="#f0f0f2"><rect width="400" height="300"/><text x="200" y="155" text-anchor="middle" fill="#ccc" font-size="16">暂无图片</text></svg>'
    );
    img.classList.add('loaded');
  };
}

/* ========== 空状态 ========== */
function showEmpty() {
  gallery.innerHTML = `
    <div class="gallery-empty">
      <span class="gallery-empty-icon">🐱</span>
      <p>还没有猫咪照片</p>
      <p style="font-size:0.9rem;margin-top:4px;">快去添加第一张吧</p>
    </div>
  `;
}

/* ========== 灯箱 ========== */
function openLightbox(index) {
  currentIndex = index;
  updateLightboxImage();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function updateLightboxImage() {
  const photo = photos[currentIndex];
  if (!photo) return;

  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src = photo.file;
    lightboxImg.alt = photo.name;
    lightboxCaption.textContent = `${photo.name} · ${photo.date}`;
    lightboxImg.style.opacity = '1';
  }, 120);

  // 箭头显隐
  btnPrev.style.display = currentIndex > 0 ? '' : 'none';
  btnNext.style.display = currentIndex < photos.length - 1 ? '' : 'none';
}

function showPrev() {
  if (currentIndex > 0) {
    currentIndex--;
    updateLightboxImage();
  }
}

function showNext() {
  if (currentIndex < photos.length - 1) {
    currentIndex++;
    updateLightboxImage();
  }
}

/* ========== 灯箱事件绑定 ========== */
function bindLightboxEvents() {
  btnClose.addEventListener('click', closeLightbox);
  btnPrev.addEventListener('click', showPrev);
  btnNext.addEventListener('click', showNext);

  // 点击背景关闭
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // 触摸滑动（移动端）
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 60) {
      diff > 0 ? showNext() : showPrev();
    }
  });
}

/* ========== 键盘操作 ========== */
function bindKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        showPrev();
        break;
      case 'ArrowRight':
        showNext();
        break;
    }
  });
}

/* ========== 工具函数 ========== */
function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
