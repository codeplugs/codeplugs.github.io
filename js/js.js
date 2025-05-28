function navigate(page) {
  history.pushState({ page }, '', '/');
  sessionStorage.setItem('currentPage', page); // Store page
  loadPage(page);
}

async function loadPage(page) {
  const app = document.getElementById('app');
  try {
    const res = await fetch('pages/' + page);
    if (!res.ok) throw new Error('Page not found');
    const html = await res.text();
    app.innerHTML = html;

    if (page === 'one.html') initOnePage();
    if (page === 'two.html') setupTwoPage();
  } catch {
    app.innerHTML = '<h1>Page not found</h1>';
  }
}

window.addEventListener('popstate', (e) => {
  const page = e.state?.page || sessionStorage.getItem('currentPage') || 'home.html';
  loadPage(page);
});

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const ytid = urlParams.get('ytid');

  let pageToLoad = 'home.html'; // default

  if (ytid) {
    // Auto-load one.html if ytid is present in URL
    pageToLoad = 'one.html';
    sessionStorage.setItem('ytid', ytid);
    sessionStorage.setItem('currentPage', pageToLoad); // ✅ Save the current page
  } else {
    // Fallback to saved page if exists
    pageToLoad = sessionStorage.getItem('currentPage') || 'home.html';
  }

  const urlPath = '/' + pageToLoad.replace('.html', '');
  history.replaceState({ page: pageToLoad }, '', urlPath);
  loadPage(pageToLoad);
});


// Example page scripts (adapt to your code)

function initOnePage() {
  const form = document.getElementById("jaxloads");


// Auto-load from ytid if exists
  const ytid = sessionStorage.getItem("ytid") || new URLSearchParams(window.location.search).get("ytid");
  if (ytid && log) {
    log.value = "Loading...\n";

    const proxyUrl = `https://my-stream-proxy.jdsjeo.workers.dev/?url=https://rvdkewwyycep.ap-southeast-1.clawcloudrun.com/api/status?id=${encodeURIComponent(ytid)}`;

    fetch(proxyUrl)
      .then(res => res.text())
      .then(text => {
        log.value = text;
        log.scrollTop = log.scrollHeight;
      })
      .catch(err => {
        log.value = "Error: " + err.message;
      });
  }


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

    log.value = "Loading...\n";

    const proxy = 'https://cloudflare-cors-anywhere.jdsjeo.workers.dev/?';
    const targetUrl = `https://rvdkewwyycep.ap-southeast-1.clawcloudrun.com/api/download?yturl=${encodeURIComponent(yturl)}&form=${format}`;

// Compose the backend API URL with parameters
    const backendApiUrl = `https://rvdkewwyycep.ap-southeast-1.clawcloudrun.com/api/download?yturl=${encodeURIComponent(yturl)}&form=${encodeURIComponent(format)}`;

    // Encode the full backend URL for the proxy 'url' param
    const proxyUrl = `https://my-stream-proxy.jdsjeo.workers.dev/?url=${encodeURIComponent(backendApiUrl)}`;




    fetch(proxyUrl)
      .then(response => {
        if (!response.body) {
          throw new Error("No response stream");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let resultText = '';

        function readChunk() {
          return reader.read().then(({ done, value }) => {
            if (done) return;
            const chunk = decoder.decode(value, { stream: true });
            resultText += chunk;
            log.value += chunk;
            log.scrollTop = log.scrollHeight; // Auto scroll
            return readChunk();
          });
        }

        return readChunk();
      })
      .catch(err => {
        log.value += "\nError: " + err.message;
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