// assets/js/cascade.js
// Random “pile of prints” cascade + simple viewer
(function () {
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

function overlapArea(a, b) {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  if (x2 <= x1 || y2 <= y1) return 0;
  return (x2 - x1) * (y2 - y1);
}

function placeWithLimit(cw, ch, w, h, placed) {
  const pad = 10;
  const tries = 30;

  for (let i = 0; i < tries; i++) {
    const x = clamp(rand(0, cw - w), pad, Math.max(pad, cw - w - pad));
    const y = clamp(rand(0, ch - h), pad, Math.max(pad, ch - h - pad));

    const rect = { x, y, w, h };

    // Reject positions that are "too covered" by any single existing image
    const maxCover = placed.reduce((m, p) => Math.max(m, overlapArea(rect, p) / (w * h)), 0);

    if (maxCover < 0.65) return rect; // allow overlap, but not total burial
  }

  // Fallback if we couldn't find a great spot
  return {
    x: clamp(rand(0, cw - w), pad, Math.max(pad, cw - w - pad)),
    y: clamp(rand(0, ch - h), pad, Math.max(pad, ch - h - pad)),
    w, h
  };
}


  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function createViewer() {
    // Create once
    let overlay = document.getElementById('ww-viewer');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'ww-viewer';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
  <div class="ww-viewer-backdrop"></div>
  <figure class="ww-viewer-figure" role="dialog" aria-modal="true">
    <button class="ww-viewer-prev" aria-label="Previous">‹</button>
    <img class="ww-viewer-img" alt="">
    <button class="ww-viewer-next" aria-label="Next">›</button>
    <figcaption class="ww-viewer-cap"></figcaption>
    <button class="ww-viewer-close" aria-label="Close">×</button>
  </figure>
`;

    overlay._items = [];
overlay._index = 0;

overlay._show = function (i) {
  if (!overlay._items.length) return;
  overlay._index = (i + overlay._items.length) % overlay._items.length;

  const item = overlay._items[overlay._index];
  const img = overlay.querySelector('.ww-viewer-img');
  const cap = overlay.querySelector('.ww-viewer-cap');

  img.src = item.src;
  img.alt = item.caption || '';
  cap.textContent = item.caption || '';
};

overlay._openAt = function (items, index) {
  overlay._items = items;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  overlay._show(index);
};

    document.body.appendChild(overlay);

    function close() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
    }

    overlay.addEventListener('click', (e) => {
      if (
        e.target.classList.contains('ww-viewer-backdrop') ||
        e.target.classList.contains('ww-viewer-close')
      ) close();
    });

    window.addEventListener('keydown', (e) => {
  if (!overlay.classList.contains('open')) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft') overlay._show(overlay._index - 1);
  if (e.key === 'ArrowRight') overlay._show(overlay._index + 1);
});


const items = imgs.map(img => ({
  src: img.src,
  caption: img.getAttribute('alt') || ''
}));


img.addEventListener('click', () => {
  lift();
  const index = imgs.indexOf(img);
  viewer._openAt(items, index);
});

overlay.querySelector('.ww-viewer-prev').addEventListener('click', () => {
  overlay._show(overlay._index - 1);
});
overlay.querySelector('.ww-viewer-next').addEventListener('click', () => {
  overlay._show(overlay._index + 1);
});


    overlay._open = function (src, caption) {
      const img = overlay.querySelector('.ww-viewer-img');
      const cap = overlay.querySelector('.ww-viewer-cap');
      img.src = src;
      img.alt = caption || '';
      cap.textContent = caption || '';
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
    };

    return overlay;
  }

  function initCascade(container) {
    const imgs = Array.from(container.querySelectorAll('.cascade-img'));
    if (!imgs.length) return;

    // Wait until images have dimensions
    const ready = imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(res => img.addEventListener('load', res, { once: true }));
    });

    Promise.all(ready).then(() => {
      const viewer = createViewer();

      // Container size
      const cw = container.clientWidth;
      const ch = container.clientHeight;

      // Base z-index
      let z = 10;

      imgs.forEach((img) => {
        // Random rotation, random position
        const rot = rand(-10, 10);             // degrees
        const scale = rand(0.98, 1.02);

        // Use actual rendered width/height (after CSS width applied)
        const w = img.getBoundingClientRect().width;
        const h = img.getBoundingClientRect().height;

        // Keep within bounds with padding
        const pad = 12;
        const x = clamp(rand(0, cw - w), pad, Math.max(pad, cw - w - pad));
        const y = clamp(rand(0, ch - h), pad, Math.max(pad, ch - h - pad));
        const placed = [];
        // Apply
        const rect = placeWithLimit(cw, ch, w, h, placed);
        placed.push(rect);

        img.style.left = `${rect.x}px`;
        img.style.top = `${rect.y}px`;
        img.style.zIndex = String(z++);
        img.style.transform = `rotate(${rot}deg) scale(${scale}) translateZ(0)`;

        // Reveal
        requestAnimationFrame(() => {
          img.style.opacity = '1';
        });

        // Bring-to-front on hover/click
        const lift = () => { img.style.zIndex = String(++z); };

        img.addEventListener('mouseenter', lift);
        img.addEventListener('mousedown', lift);

        // Open viewer on click
        img.addEventListener('click', () => {
          lift();
          const caption = img.getAttribute('alt') || '';
          viewer._open(img.src, caption);
        });
      });
    });
  }

  // Public init
  window.initWindwoodCascade = function () {
    document.querySelectorAll('[data-cascade]').forEach(initCascade);
  };
})();
