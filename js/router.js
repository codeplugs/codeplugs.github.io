const routes = [
  { path: '/', view: 'home.html', title: 'Home' },
  { path: '/about', view: 'about.html', title: 'About' },
  { path: '/contact', view: 'contact.html', title: 'Contact' },
  { path: '/one', view: 'one.html', title: 'One' },
  { path: '/two', view: 'two.html', title: 'Two' },
  { path: '/user/:id', view: 'user.html', title: 'User Profile' } // dynamic example
];

function matchRoute(path) {
  for (const route of routes) {
    const routeParts = route.path.split('/');
    const pathParts = path.split('/');

    if (routeParts.length !== pathParts.length) continue;

    const params = {};
    let match = true;

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        const paramName = routeParts[i].slice(1);
        params[paramName] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }

    if (match) return { route, params };
  }

  return null;
}

async function router() {
  const hash = location.hash.slice(1) || '/';
  const { route, params } = matchRoute(hash) || {};

  const page = route ? route.view : '404.html';
  const title = route ? route.title : 'Page Not Found';

  try {
    const res = await fetch(page);
    if (!res.ok) throw new Error('Fetch failed');
    const html = await res.text();
    document.getElementById('app').innerHTML = html;
    document.title = title;

    // Optional: you can pass params to the view script here
    if (params) {
      window.currentRouteParams = params;
    }
  } catch (err) {
    document.getElementById('app').innerHTML = '<h1>Error loading page</h1>';
    document.title = 'Error';
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);