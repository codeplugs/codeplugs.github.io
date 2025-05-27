function navigate(path, file) {
  history.pushState({ file }, '', path);
  loadPage(file);
}

async function loadPage(file) {
  try {
    const res = await fetch(file);
    const html = await res.text();
    const app = document.getElementById('app');
    app.innerHTML = html;

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
    if (file === 'one.html') initOnePage();
    if (file === 'two.html') setupTwoPage();
  } catch {
    document.getElementById('app').innerHTML = '<h1>Page not found</h1>';
  }
}

window.addEventListener('popstate', (e) => {
  const file = e.state?.file || 'home.html';
  loadPage(file);
});

window.addEventListener('DOMContentLoaded', () => {
  const routes = {
    '/': 'home.html',
    '/about': 'about.html',
    '/two': 'two.html',
    '/one': 'one.html'
  };

  const savedPath = sessionStorage.getItem('redirectPath');
  sessionStorage.removeItem('redirectPath');

  const path = savedPath || location.pathname;
  const file = routes[path] || 'home.html';

  history.replaceState({ file }, '', path);
  loadPage(file);
});


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
        console.log(JSON.stringify(data, null, 2));
      })
      .catch(err => {
        result.value = 'Error fetching user info.';
      });
  });
}
