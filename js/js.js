function navigate(page) {
  history.pushState({ page }, '', '/'); // keep URL at root (or add hash if you want)
  loadPage(page);
}

async function loadPage(page) {
  const app = document.getElementById('app');
  try {
    const res = await fetch('pages/' + page);
    if (!res.ok) throw new Error('Page not found');
    const html = await res.text();
    app.innerHTML = html;

    // Run page-specific setup if needed
    if (page === 'one.html') initOnePage();
    if (page === 'two.html') setupTwoPage();
  } catch {
    app.innerHTML = '<h1>Page not found</h1>';
  }
}

window.addEventListener('popstate', (e) => {
  const page = e.state?.page || 'home.html';
  loadPage(page);
});

window.addEventListener('DOMContentLoaded', () => {
  // Load home page on initial load
  loadPage('home.html');
});

// Example page scripts (adapt to your code)

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