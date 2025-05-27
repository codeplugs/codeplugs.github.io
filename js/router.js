const routes = {
  '/': 'home.html',
  '/about': 'about.html',
  '/contact': 'contact.html',
'/one': 'one.html'
'/two: 'two.html
};

async function router() {
  const path = location.hash.slice(1) || '/';
  const page = routes[path] || '404.html';

  try {
    const res = await fetch(page);
    const html = await res.text();
    document.getElementById('app').innerHTML = html;
  } catch (err) {
    document.getElementById('app').innerHTML = '<h1>Error loading page</h1>';
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);