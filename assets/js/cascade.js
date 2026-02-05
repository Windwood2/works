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
  // If nothing placed yet, it's fine
  if (!placed.length) return true;

  // We’ll sample 4 thin “edge strips” on the new image and see if ANY strip
  // is not heavily covered.
  const strips = [
    { x: rect.x, y: rect.y, w: rect.w, h: peekPx },                 // top strip
    { x: rect.x, y: rect.y + rect.h - peekPx, w: rect.w, h: peekPx },// bottom strip
    { x: rect.x, y: rect.y, w: peekPx, h: rect.h },                 // left strip
    { x: rect.x + rect.w - peekPx, y: rect.y, w: peekPx, h: rect.h } // right strip
  ];

  // A strip is “good” if less than ~70% of that strip is covered by ANY single prior image
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
      const peekPx = 40; // how much exposed edge we require
      const x = clamp(rand(0, cw - w), pad, Math.max(pad, cw - w - pad));
      const y = clamp(rand(0, ch - h), pad, Math.max(pad, ch - h - pad));
      const rect = { x, y, w, h };

      // Peek rule: ensure at least one edge strip stays clickable
      if (!edgePeekOK(rect, placed, peekPx)) continue;


      // Max coverage by any single prior image
      const maxCover = placed.reduce(
        (m, p) => Math.max(m, overlapArea(rect, p) / (w * h)),
        0
      );

      // Allow overlap, but reject “mostly covered” placements
      if (maxCover < 0.55) return rect;

    }

// Fallback: place near top-left-ish in a stepped stack so it's never lost
const step = 28;
const idx = placed.length; // 0..n
return {
  x: 14 + (idx * step) % Math.max(14, (cw - w - 28)),
  y: 14 + (idx * step) % Math.max(14, (ch - h - 28)),
  w, h
};


    // Fallback
    return {
      x: clamp(rand(0, cw - w), pad, Math.max(pad, cw - w - pad)),
      y: clamp(rand(0, ch - h), pad, Math.max(pad, ch - h - pad)),
      w,
      h,
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
      <figure class="ww-viewer-figure" role="dialog" aria-modal="true">
        <button class="ww-viewer-prev" aria-label="Previous">‹</button>
        <img class="ww-viewer-img" alt="">
        <button class="ww-viewer-next" aria-label="Next">›</button>
        <figcaption class="ww-viewer-cap"></figcaption>
        <button class="ww-viewer-close" aria-label="Close">×</button>
      </figure>
    `;

    document.body.appendChild(overlay);

    function close() {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
    }

    overlay.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("ww-viewer-backdrop") ||
        e.target.classList.contains("ww-viewer-close")
      ) {
        close();
      }
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

    overlay._items = [];
    overlay._index = 0;

    overlay._show = function (i) {
      if (!overlay._items.length) return;
      overlay._index = (i + overlay._items.length) % overlay._items.length;

      const item = overlay._items[overlay._index];
      const img = overlay.querySelector(".ww-viewer-img");
      const cap = overlay.querySelector(".ww-viewer-cap");

      img.src = item.src;
      img.alt = item.caption || "";
      cap.textContent = item.caption || "";
    };

    overlay._openAt = function (items, index) {
      overlay._items = items;
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      overlay._show(index);
    };

    return overlay;
  }

  // -------------------------
  // Cascade init
  // -------------------------
  function initCascade(container) {
    const imgs = Array.from(container.querySelectorAll(".cascade-img"));
    if (!imgs.length) return;

    const viewer = createViewer();

    // Wait for images so layout sizes are real
    const ready = imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((res) => img.addEventListener("load", res, { once: true }));
    });

    Promise.all(ready).then(() => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;

      let z = 10;
      const placed = [];

      // page-only gallery items
      const items = imgs.map((img) => ({
        src: img.src,
        caption: img.getAttribute("alt") || "",
      }));

      imgs.forEach((img, idx) => {
        // Random rotation / scale
        const rot = rand(-12, 12);
        const scale = rand(0.98, 1.02);

        // Use actual CSS width/height after load
        const rectNow = img.getBoundingClientRect();
        const w = rectNow.width || 260;
        const h = rectNow.height || 180;

        // Place with overlap limit
        const pos = placeWithLimit(cw, ch, w, h, placed);
        placed.push(pos);

        img.style.left = `${pos.x}px`;
        img.style.top = `${pos.y}px`;
        img.style.zIndex = String(z++);
        img.style.transform = `rotate(${rot}deg) scale(${scale}) translateZ(0)`;

        // Reveal (your CSS starts opacity 0)
        requestAnimationFrame(() => {
          img.style.opacity = "1";
        });

        // Lift on hover / click
        const lift = () => {
          img.style.zIndex = String(++z);
        };

        img.addEventListener("mouseenter", lift);
        img.addEventListener("mousedown", lift);

        // Click opens viewer at this index
        img.addEventListener("click", () => {
          lift();
          viewer._openAt(items, idx);
        });
      });
    });
  }
  
    // Public init
  window.initWindwoodCascade = function () {
    document.querySelectorAll("[data-cascade]").forEach(initCascade);
  };
})();
