const routes = {
  '/': '<h1>Home</h1><p>Welcome to the Bootstrap SPA.</p>',
  '/about': '<h1>About</h1><p>This is the about page.</p>',
  '/contact': '<h1>Contact</h1><p>Contact us via email@example.com.</p>'
};

function router() {
  const path = location.hash.slice(1) || '/';
  const app = document.getElementById('app');
  app.innerHTML = routes[path] || '<h1>404 - Page Not Found</h1>';
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
