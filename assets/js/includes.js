// assets/js/includes.js
// Load head, header, and footer using dynamic base detection.
// Head fragment is parsed and its <head> children are appended into the real <head>.

(async function () {
  // =========================
  // Theme switch (change ONE word)
  // =========================
  const THEME = 'theme-forest';


  document.documentElement.classList.remove('theme-warm','theme-daylight','theme-slate','theme-forest','theme-debug','theme-default');
  document.documentElement.classList.add(THEME);


  // =========================
  // Detect base path from current URL
  // =========================
  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);

  // If first segment looks like a file (contains a dot), don't treat it as a folder.
  let base = '/';
  if (parts.length > 0 && !parts[0].includes('.')) {
    base = '/' + parts[0] + '/';
  }

  // =========================
  // Load head.html into the REAL <head>
  // =========================
 async function loadHead(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Fetch failed: ' + res.status);

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // head.html is a fragment, so nodes may land in body
    const nodes = (doc.head && doc.head.children && doc.head.children.length)
      ? Array.from(doc.head.children)
      : Array.from(doc.body.children);

    // Remove previously injected head nodes (prevents duplicates on navigation)
    document.querySelectorAll('[data-ww-head="1"]').forEach(n => n.remove());

    // First append non-scripts (links, meta, title, etc.)
    const scriptNodes = [];
    for (const node of nodes) {
      if (node.tagName === 'SCRIPT') {
        scriptNodes.push(node);
      } else {
        const clone = document.importNode(node, true);
        clone.setAttribute('data-ww-head', '1');
        document.head.appendChild(clone);
      }
    }

    // Then append scripts as *new* script elements (guarantees execution)
    for (const node of scriptNodes) {
      const s = document.createElement('script');
      s.setAttribute('data-ww-head', '1');

      // copy attributes
      for (const attr of node.attributes) s.setAttribute(attr.name, attr.value);

      if (node.src) {
        s.src = node.getAttribute('src');
      } else {
        s.textContent = node.textContent;
      }

      // IMPORTANT: dynamically added scripts should NOT use defer
      s.defer = false;

      // Wait for external scripts to load before continuing
      await new Promise((resolve, reject) => {
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

  } catch (e) {
    console.warn('Head include load failed:', url, e);
  }
}



  // =========================
  // Load body fragments (header/footer)
  // =========================
  async function loadFragment(url, selector) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Fetch failed: ' + res.status);

      const html = await res.text();
      const container = document.querySelector(selector);
      if (container) container.innerHTML = html;
    } catch (e) {
      console.warn('Include load failed:', url, e);
    }
  }

// Load head, header, footer
await loadHead(base + 'includes/head.html');
await loadFragment(base + 'includes/header.html', '#site-header');
await loadFragment(base + 'includes/secret-nav.html', '#secret-nav');
await loadFragment(base + 'includes/footer.html', '#site-footer');


// Initialize AFTER injection
if (window.initWindwoodUI) window.initWindwoodUI();
if (window.initWindwoodCascade) window.initWindwoodCascade();

})();
