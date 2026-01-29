// assets/js/includes.js
// Load header and footer using dynamic base detection

(async function () {

  // Detect base path from current URL
  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);
  let base = '/';

  if (parts.length > 0) {
    base = '/' + parts[0] + '/';
  }

  async function load(url, selector) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed: ' + res.status);
      const html = await res.text();
      const container = document.querySelector(selector);
      if (container) container.innerHTML = html;
    } catch (e) {
      console.warn('Include load failed:', url, e);
    }
  }

  // Load ONLY header and footer (head is no longer injected)
  await load(base + 'includes/header.html', '#site-header');
  await load(base + 'includes/footer.html', '#site-footer');

  // Initialize UI after injection
  setTimeout(() => {
    if (window.initWindwoodUI) window.initWindwoodUI();
  }, 60);

})();

