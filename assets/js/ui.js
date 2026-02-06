// assets/js/ui.js
// Mobile menu, back-to-top, and lightbox

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
      if (window.scrollY > 300) back.classList.add('visible');
      else back.classList.remove('visible');
    });

    back.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* -------------------------
     Lightbox
     - images should have class "lightbox-thumb"
     - captions read from data-caption attribute (or alt)
     ------------------------- */
  function initLightbox() {
    const thumbs = Array.from(document.querySelectorAll('img.lightbox-thumb'));
    if (!thumbs.length) return;

    const gallery = thumbs.map((img) => ({
      src: img.dataset.full || img.src,
      caption: img.getAttribute('data-caption') || img.alt || ''
    }));

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
      imgEl.src = gallery[index].src;
      imgEl.alt = gallery[index].caption || '';
      captionEl.textContent = gallery[index].caption || '';
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
      const prev = (currentIndex - 1 + gallery.length) % gallery.length;
      const next = (currentIndex + 1) % gallery.length;
      [prev, next].forEach(i => {
        const pre = new Image();
        pre.src = gallery[i].src;
      });
    }

    thumbs.forEach((t, i) => {
      t.addEventListener('click', (e) => {
        e.preventDefault();
        openAt(i);
      });
      t.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openAt(i);
        }
      });
    });

    closeBtn.addEventListener('click', close);
    leftArrow.addEventListener('click', () => showNext(-1));
    rightArrow.addEventListener('click', () => showNext(1));

    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showNext(-1);
      if (e.key === 'ArrowRight') showNext(1);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }

})();
