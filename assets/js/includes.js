// assets/js/includes.js
// Load head, header, and footer with dynamic base detection.
// Head fragment is parsed and its head children are appended into the real <head>.

(async function () {
  // Detect base path from current URL
  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);
  let base = '/';
  if (parts.length > 0) base = '/' + parts[0] + '/';

  // Generic loader for body fragments (header/footer)
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

  // Load head fragment and move its head children into the real <head>
  try {
    const res = await fetch(base + 'includes/head.html', { cache: 'no-store' });
    if (!res.ok) throw new Error('Fetch failed: ' + res.status);
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Append each child of the parsed head into the real head
    Array.from(doc.head.children).forEach(node => {
      document.head.appendChild(document.importNode(node, true));
    });

    // Recreate scripts so they execute (browsers don't run scripts added via innerHTML)
    Array.from(document.head.querySelectorAll('script')).forEach(oldScript => {
      if (!oldScript.dataset.injected) {
        const s = document.createElement('script');
        if (oldScript.src) s.src = oldScript.src;
        if (oldScript.type) s.type = oldScript.type;
        if (oldScript.defer) s.defer = true;
        if (!oldScript.src) s.textContent = oldScript.textContent;
        s.dataset.injected = '1';
        oldScript.parentNode.replaceChild(s, oldScript);
      }
    });
  } catch (e) {
// Load head fragment and move its head children into the real <head>
try {
  const res = await fetch(base + 'includes/head.html', { cache: 'no-store' });
  if (!res.ok) throw new Error('Fetch failed: ' + res.status);
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Append each child of the parsed head into the real head
  Array.from(doc.head.children).forEach(node => {
    document.head.appendChild(document.importNode(node, true));
  });

  // Recreate scripts so they execute
  Array.from(document.head.querySelectorAll('script')).forEach(oldScript => {
    if (!oldScript.dataset.injected) {
      const s = document.createElement('script');
      if (oldScript.src) s.src = oldScript.src;
      if (oldScript.type) s.type = oldScript.type;
      if (oldScript.defer) s.defer = true;
      if (!oldScript.src) s.textContent = oldScript.textContent;
      s.dataset.injected = '1';
      oldScript.parentNode.replaceChild(s, oldScript);
    }
  });
} catch (e) {
  console.warn('Head include load failed:', base + 'includes/head.html', e);
}


  // Load header and footer into body placeholders
  await loadFragment(base + 'includes/header.html', '#site-header');
  await loadFragment(base + 'includes/footer.html', '#site-footer');

  // Small delay to allow injected content to settle, then initialize UI if present
  setTimeout(() => {
    if (window.initWindwoodUI) {
      try { window.initWindwoodUI(); } catch (e) { console.warn('initWindwoodUI error', e); }
    }
  }, 60);
})();



