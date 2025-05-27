const routes = {
  '/': 'home.html',
  '/about': 'about.html',
  '/contact': 'contact.html',
  '/one': 'one.html',
  '/two': 'two.html'
};

async function loadPage(file) {
  try {
    const res = await fetch(file);
    const html = await res.text();
    const app = document.getElementById('app');
    app.innerHTML = html;

    // Execute any inline scripts from the loaded page
    app.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      document.body.appendChild(newScript);
      document.body.removeChild(newScript);
    });

    // Initialize page-specific JS
    if (file === 'one.html') initOnePage();
    if (file === 'two.html') setupTwoPage();
  } catch {
    document.getElementById('app').innerHTML = '<h1>Page not found</h1>';
  }
}

function router() {
  const hash = location.hash || '#/';
  const path = hash.slice(1);
  const file = routes[path] || 'home.html';
  loadPage(file);
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);


// Your page init functions (copy from your previous js)

function initOnePage() {
  const form = document.getElementById("jaxloads");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const yturl = document.getElementById("yt_url").value.trim();
    const format = document.getElementById("format_select").value;
    const log = document.getElementById("log_result");

    if (!yturl || !format) {
      log.value = "Please enter both URL and format.";
      return;
    }

    log.value = "Loading...";

    fetch(`https://rvdkewwyycep.ap-southeast-1.clawcloudrun.com/api/download?yturl=${encodeURIComponent(yturl)}&form=${format}`)
      .then(res => res.text())
      .then(data => {
        log.value = data;
      })
      .catch(err => {
        log.value = "Error: " + err.message;
      });
  });
}

function setupTwoPage() {
  const form = document.getElementById('githubForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const result = document.getElementById('result');
    if (!username) {
      result.value = 'Please enter a username.';
      return;
    }

    fetch('https://api.github.com/users/' + encodeURIComponent(username))
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        result.value = JSON.stringify(data, null, 2);
      })
      .catch(() => {
        result.value = 'Error fetching user info.';
      });
  });
}