// Fetch and inject head fragment into the real <head>
fetch('includes/head.html')
  .then(r => r.text())
  .then(html => {
    // Parse the fragment into a document
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Move each child of the parsed head into the real head
    Array.from(doc.head.children).forEach(node => {
      // Import node to current document and append
      document.head.appendChild(document.importNode(node, true));
    });

    // If includes/head.html contains inline scripts that must execute,
    // re-create them so they run (browsers don't execute scripts added via innerHTML)
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
  })
  .catch(err => console.error('Failed to load head include:', err));
