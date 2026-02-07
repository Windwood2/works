// assets/js/cascade.js
// Random “pile of prints” cascade + page-only gallery viewer (prev/next)

(function () {
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // -------------------------
  // Placement helpers (avoid total burial)
  // -------------------------
  function overlapArea(a, b) {
    const x1 = Math.max(a.x, b.x);
    const y1 = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.w, b.x + b.w);
    const y2 = Math.min(a.y + a.h, b.y + b.h);
    if (x2 <= x1 || y2 <= y1) return 0;
    return (x2 - x1) * (y2 - y1);
  }

  function edgePeekOK(rect, placed, peekPx) {
    if (!placed.length) return true;

    const strips = [
      { x: rect.x, y: rect.y, w: rect.w, h: peekPx },                  // top
      { x: rect.x, y: rect.y + rect.h - peekPx, w: rect.w, h: peekPx },// bottom
      { x: rect.x, y: rect.y, w: peekPx, h: rect.h },                  // left
      { x: rect.x + rect.w - peekPx, y: rect.y, w: peekPx, h: rect.h } // right
    ];

    const STRIP_MAX_COVER = 0.80;

    return strips.some(strip => {
      const stripArea = strip.w * strip.h;
      if (stripArea <= 0) return false;

      const maxCover = placed.reduce((m, p) => {
        const covered = overlapArea(strip, p);
        return Math.max(m, covered / stripArea);
      }, 0);

      return maxCover < STRIP_MAX_COVER;
    });
  }

  function placeWithLimit(cw, ch, w, h, placed) {
    const pad = 10;
    const tries = 140;

    for (let i = 0; i < tries; i++) {
      const peekPx = 30;
      const x = clamp(rand(0, cw - w), pad, Math.max(pad, cw - w - pad));
      const y = clamp(rand(0, ch - h), pad, Math.max(pad, ch - h - pad));
      const rect = { x, y, w, h };
	  // Soft spacing bias — avoid tight clustering
const MIN_DIST = 170; // increase = more even spread

const tooClose = placed.some(p => {
  const dx = (p.x + p.w / 2) - (x + w / 2);
  const dy = (p.y + p.h / 2) - (y + h / 2);
  return Math.hypot(dx, dy) < MIN_DIST;
});

if (tooClose) continue;


      if (!edgePeekOK(rect, placed, peekPx)) continue;

      const maxCover = placed.reduce(
        (m, p) => Math.max(m, overlapArea(rect, p) / (w * h)),
        0
      );

      if (maxCover < 0.40) return rect;
    }

    // Fallback: stepped stack so it's never lost
    const step = 28;
    const idx = placed.length;
    return {
      x: 14 + (idx * step) % Math.max(14, (cw - w - 28)),
      y: 14 + (idx * step) % Math.max(14, (ch - h - 28)),
      w, h
    };
  }

  // -------------------------
  // Viewer (page-only)
  // -------------------------
 function createViewer() {
  let overlay = document.getElementById("ww-viewer");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "ww-viewer";
  overlay.setAttribute("aria-hidden", "true");

  overlay.innerHTML = `
  <div class="ww-viewer-backdrop"></div>

  <button class="ww-viewer-prev" aria-label="Previous">‹</button>
  <button class="ww-viewer-next" aria-label="Next">›</button>
  <button class="ww-viewer-close" aria-label="Close">×</button>
  
  <figure class="ww-viewer-figure" role="dialog" aria-modal="true">
    <img class="ww-viewer-img" alt="">
    
    
  </figure>
`;
/* <figcaption class="ww-viewer-cap"></figcaption>    removed  caption from just above </figure> */

  document.body.appendChild(overlay);

  const img = overlay.querySelector(".ww-viewer-img");
  const cap = overlay.querySelector(".ww-viewer-cap");

  /* =========================
     ZOOM STATE (GLOBAL TO VIEWER)
     ========================= */
  let scale = 1;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let startX = 0;
  let startY = 0;

  function applyTransform() {
    img.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    img.classList.toggle("zoomed", scale > 1);
  }

  function resetZoom() {
    scale = 1;
    panX = 0;
    panY = 0;
    applyTransform();
  }

  /* =========================
     ZOOM EVENTS (ONCE)
     ========================= */
  img.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    scale = Math.min(4, Math.max(1, scale + delta));
    if (scale === 1) { panX = 0; panY = 0; }
    applyTransform();
  }, { passive: false });

  img.addEventListener("mousedown", (e) => {
    if (scale <= 1) return;
    isPanning = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    img.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    applyTransform();
  });

  window.addEventListener("mouseup", () => {
    isPanning = false;
    img.style.cursor = scale > 1 ? "grab" : "zoom-in";
  });

  /* =========================
     VIEWER LOGIC
     ========================= */
  overlay._items = [];
  overlay._index = 0;

  overlay._show = function (i) {
    if (!overlay._items.length) return;
    overlay._index = (i + overlay._items.length) % overlay._items.length;
    const item = overlay._items[overlay._index];

    img.src = item.src;
    img.alt = item.caption || "";
    cap.textContent = item.caption || "";

    resetZoom(); // ✅ always reset on image change
  };

 overlay._openAt = function (items, index) {
  overlay._items = items;
  overlay._index = index;              // ✅ ADD THIS

  document.body.classList.add("viewer-open");

  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");

  overlay._show(index);                // resetZoom happens inside _show
};


  function close() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    resetZoom();
	document.body.classList.remove("viewer-open");

  }

  overlay.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("ww-viewer-backdrop") ||
      e.target.classList.contains("ww-viewer-close")
    ) close();
  });

  overlay.querySelector(".ww-viewer-prev").addEventListener("click", () => {
    overlay._show(overlay._index - 1);
  });

  overlay.querySelector(".ww-viewer-next").addEventListener("click", () => {
    overlay._show(overlay._index + 1);
  });

  window.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") overlay._show(overlay._index - 1);
    if (e.key === "ArrowRight") overlay._show(overlay._index + 1);
  });

  return overlay;
}


  // -------------------------
  // Cascade init
  // -------------------------
  function initCascade(container) {
    // Guard: don't init twice (prevents “stuck opacity 0” from re-runs)
    if (container.dataset.cascadeInit === "1") return;
    container.dataset.cascadeInit = "1";

    const imgs = Array.from(container.querySelectorAll(".cascade-img"));
    if (!imgs.length) return;

    const viewer = createViewer();

    const ready = imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((res) => img.addEventListener("load", res, { once: true }));
    });

    Promise.all(ready).then(() => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;

      let z = 10;
      const placed = [];

      const items = imgs.map((img) => ({
        src: img.src,
        caption: img.getAttribute("alt") || "",
      }));

      imgs.forEach((img, idx) => {
        const rot = rand(-12, 12);
        const scale = rand(0.98, 1.02);

        const rectNow = img.getBoundingClientRect();
        const w = rectNow.width || 260;
        const h = rectNow.height || 180;

        const pos = placeWithLimit(cw, ch, w, h, placed);
        placed.push(pos);

        img.style.left = `${pos.x}px`;
        img.style.top = `${pos.y}px`;
        img.style.zIndex = String(z++);
        img.style.transform = `rotate(${rot}deg) scale(${scale}) translateZ(0)`;

        // Reveal reliably
        requestAnimationFrame(() => {
          img.style.opacity = "1";
        });

        const lift = () => {
          img.style.zIndex = String(++z);
        };

        img.addEventListener("mouseenter", lift);
        img.addEventListener("mousedown", lift);

        img.addEventListener("click", () => {
          lift();
          viewer._openAt(items, idx);resetZoom();

        });
      });
    });
  }

  // Public init (kept)
  window.initWindwoodCascade = function () {
    document.querySelectorAll("[data-cascade]").forEach(initCascade);
  };

 
})();

