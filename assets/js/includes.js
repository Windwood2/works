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

      // Append each child of the parsed head into the real head
      Array.from(doc.head.children).forEach(node => {
        document.head.appendChild(document.importNode(node, true));
      });
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
  await loadFragment(base + 'includes/footer.html', '#site-footer');

  // Initialize UI after injection
  setTimeout(() => {
    if (window.initWindwoodUI) {
      try { window.initWindwoodUI(); } catch (e) { console.warn('initWindwoodUI error', e); }
    }
  }, 60);
})();
