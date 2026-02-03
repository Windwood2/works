// assets/js/includes.js
// Dynamically detect the correct base path (e.g., /works/) so includes load correctly

(async function () {

 // assets/js/includes.js
// Dynamically detect the correct base path (e.g., /works/) so includes load correctly

(async function () {

  // Detect base path from current URL
  // Example: https://windwood2.github.io/works/boxes.html
  // pathname = "/works/boxes.html" → base = "/works/"
  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);
  let base = '/';

  if (parts.length > 0) {
    // If first segment is the repo name, use it as base
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

  // Load includes using the detected base path
  await load(base + 'includes/head.html', 'head');
  await load(base + 'includes/header.html', '#site-header');
  await load(base + 'includes/footer.html', '#site-footer');

  // Initialize UI after injection
  setTimeout(() => {
    if (window.initWindwoodUI) window.initWindwoodUI();
  }, 60);

})();
