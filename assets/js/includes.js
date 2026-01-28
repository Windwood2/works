// assets/js/includes.js
// Loads header/footer/head into placeholders and initializes UI
(async function () {
  async function load(url, selector) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed: ' + res.status);
      const html = await res.text();
      const container = document.querySelector(selector);
      if (container) container.innerHTML = html;
      return true;
    } catch (e) {
      console.warn('Include load failed', url, e);
      return false;
    }
  }

  // Root paths (B1): adjust only if you later host under a subpath
  await load('/includes/head.html', 'head');
  await load('/includes/header.html', '#site-header');
  await load('/includes/footer.html', '#site-footer');

  // Small delay to ensure DOM updated before initializing UI
  setTimeout(() => {
    if (window.initWindwoodUI) window.initWindwoodUI();
  }, 60);
})();
