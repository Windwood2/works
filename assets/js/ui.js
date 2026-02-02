// assets/js/ui.js
// Mobile menu, back-to-top, and lightbox (adjacent preload, keyboard support)
// Attach this script with defer on every page: <script src="/assets/js/ui.js" defer></script>

(function () {
  // Expose init function so includes.js can call it after injection
  window.initWindwoodUI = function initWindwoodUI() {
    initMobileMenu();
    initBackToTop();
    initLightbox();
  };

  /* -------------------------
     Mobile menu (right-side floating)
     ------------------------- */
  function initMobileMenu() {
    const burger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    if (!burger || !mobileNav) return;

    burger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileNav.setAttribute('aria-hidden', open ? 'false' : 'true');
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileNav.classList.contains('open')) return;
      const inside = mobileNav.contains(e.target) || burger.contains(e.target);
      if (!inside) {
        mobileNav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /* -------------------------
     Back to top (middle-right)
     ------------------------- */
  function initBackToTop() {
    const back = document.getElementById('back-to-top');
    if (!back) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) back.classList.add('visible'); else back.classList.remove('visible');
    });
    back.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* -------------------------
     Lightbox
     - images should have class "lightbox-thumb"
     - captions read from data-caption attribute
     - lazy loading via loading="lazy" on thumbnails
     ------------------------- */
  function initLightbox() {
    const thumbs = Array.from(document.querySelectorAll('img.lightbox-thumb'));
    if (!thumbs.length) return;

    // Build gallery index from DOM order
    const gallery = thumbs.map((img, i) => ({
      el: img,
      src: img.dataset.full || img.src,
      caption: img.datasetCaption || img.getAttribute('data-caption') || img.alt || ''
    }));

    // Create overlay elements once
    let overlay = document.querySelector('.lightbox-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'lightbox-overlay';
      overlay.innerHTML = `
        <button class="lightbox-close" aria-label="Close">✕</button>
        <div class="lightbox-arrow left" data-dir="prev" aria-hidden="false">‹</div>
        <img class="lightbox-image" alt="">
        <div class="lightbox-arrow right" data-dir="next" aria-hidden="false">›</div>
        <div class="lightbox-caption" role="note"></div>
      `;
      document.body.appendChild(overlay);
    }

    const imgEl = overlay.querySelector('.lightbox-image');
    const captionEl = overlay.querySelector('.lightbox-caption');
    const closeBtn = overlay.querySelector('.lightbox-close');
    const leftArrow = overlay.querySelector('.lightbox-arrow.left');
    const rightArrow = overlay.querySelector('.lightbox-arrow.right');

    let currentIndex = -1;

    function openAt(index) {
      if (index < 0 || index >= gallery.length) return;
      currentIndex = index;
      const item = gallery[currentIndex];
      imgEl.src = item.src;
      imgEl.alt = item.caption || '';
      captionEl.textContent = item.caption || '';
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      preloadAdjacent();
    }

    function close() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      imgEl.src = '';
      currentIndex = -1;
    }

    function showNext(delta) {
      if (currentIndex < 0) return;
      let next = currentIndex + delta;
      if (next < 0) next = gallery.length - 1;
      if (next >= gallery.length) next = 0;
      openAt(next);
    }

    function preloadAdjacent() {
      // preload prev and next only
      const prev = (currentIndex - 1 + gallery.length) % gallery.length;
      const next = (currentIndex + 1) % gallery.length;
      [prev, next].forEach(i => {
        const url = gallery[i].src;
        const img = new Image();
        img.src = url;
      });
    }

    // Attach click handlers to thumbs
    thumbs.forEach((t, i) => {
      t.addEventListener('click', (e) => {
        e.preventDefault();
        openAt(i);
      });
      // allow Enter key on focused thumbnail
      t.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openAt(i);
        }
      });
    });

    // Overlay controls
    closeBtn.addEventListener('click', close);
    leftArrow.addEventListener('click', () => showNext(-1));
    rightArrow.addEventListener('click', () => showNext(1));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showNext(-1);
      if (e.key === 'ArrowRight') showNext(1);
    });

    // Click outside image to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("cascade-container");
  if (!container) return; // Do nothing on pages without the cascade

  // CNC Carvings sample images
  const images = [
    "works/images/ww-cnc-carving-016.jpg",
    "works/images/ww-cnc-carving-017.jpg",
    "works/images/ww-cnc-carving-018.jpg",
       "works/images/ww-cnc-carving-019.jpg",
       "works/images/ww-cnc-carving-020.jpg",
       "works/images/ww-cnc-carving-021.jpg",
       "works/images/ww-cnc-carving-022.jpg",
       "works/images/ww-cnc-carving-023.jpg",
       "works/images/ww-cnc-carving-024.jpg",
       "works/images/ww-cnc-carving-025.jpg",
       "works/images/ww-cnc-carving-026.jpg",
       "works/images/ww-cnc-carving-027.jpg",
    
  ];

  // Shuffle
  const shuffled = images
    .map(x => ({ x, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(o => o.x);

  shuffled.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "cascade-img";

    // S-curve horizontal offset
    const xOffset = Math.sin(i / 2) * 80;

    // Vertical spacing
    const yOffset = i * 180;

    // Initial position (for animation)
    img.style.transform = `translate(${xOffset}px, ${yOffset + 40}px)`;
    img.style.opacity = 0;

    container.appendChild(img);

    // Animate into place
    setTimeout(() => {
      img.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      img.style.opacity = 1;
    }, i * 120);

    // Lightbox hook
    img.addEventListener("click", () => {
      if (typeof openLightbox === "function") {
        openLightbox(src);
      }
    });
  });

});


})();
