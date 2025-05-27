function navigate(path, file) {
  history.pushState({ file }, '', path);
  loadPage(file);
}

async function loadPage(file) {
  try {
    const res = await fetch(file);
    const html = await res.text();
    document.getElementById('app').innerHTML = html;
  } catch {
    document.getElementById('app').innerHTML = '<h1>Page not found</h1>';
  }
}

// When user clicks browser back/forward
window.onpopstate = (e) => {
  const file = e.state?.file || 'home.html';
  loadPage(file);
};

// When page first loads
window.addEventListener('DOMContentLoaded', () => {
  const routes = {
    '/': 'home.html',
    '/about': 'about.html',
    '/contact': 'contact.html',
    '/one': 'one.html',
    '/two': 'two.html',
  };

  const path = location.pathname;
  const file = routes[path] || 'home.html';
  history.replaceState({ file }, '', path);
  loadPage(file);
});