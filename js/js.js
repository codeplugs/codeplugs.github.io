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

  let pageToLoad = 'home.html';

  if (ytid) {
    pageToLoad = 'one.html';
    sessionStorage.setItem('ytid', ytid);
    sessionStorage.setItem('currentPage', pageToLoad);
    history.replaceState({ page: pageToLoad }, '', `?ytid=${ytid}`); // ✅ Place this here
  } else {
    pageToLoad = sessionStorage.getItem('currentPage') || 'home.html';
    history.replaceState({ page: pageToLoad }, '', '/');
  }

  loadPage(pageToLoad);
});

// Example page scripts (adapt to your code)


function initOnePage() {
  const form = document.getElementById("jaxloads");
  const log = document.getElementById("log_result");

  // Auto-load from ytid if exists
  const urlParams = new URLSearchParams(window.location.search);
const ytid = urlParams.get("ytid"); // Only use URL param directly
if (ytid && log) {
  log.value = "Loading...\n";
  startPollingLog(ytid, log);
}


  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const yturl = document.getElementById("yt_url").value.trim();
    const format = document.getElementById("format_select").value;
    const bgChecked = document.getElementById("background").checked;
    const bgValue = bgChecked ? "1" : "0";

    if (!yturl || !format) {
      log.value = "Please enter both URL and format.";
      return;
    }

    log.value = "Loading...\n";

    // Compose the backend API URL with all 3 params
    const backendApiUrl = `https://rvdkewwyycep.ap-southeast-1.clawcloudrun.com/api/download?yturl=${encodeURIComponent(yturl)}&form=${encodeURIComponent(format)}&bg=${bgValue}`;
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
    if (done) {
      // After streaming is done, extract job ID if available
      const match = resultText.match(/Job started with ID:\s*([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        const extractedId = match[1];
        const extraMsg = `\nVisit https://codeplugs.github.io/?ytid=${extractedId} to check background process\n`;
        log.value += extraMsg;
        log.scrollTop = log.scrollHeight;
      }
      return;
    }

    const chunk = decoder.decode(value, { stream: true });
    resultText += chunk;
    log.value += chunk;
    log.scrollTop = log.scrollHeight;

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

function startPollingLog(ytid, logElement) {
  let previousText = "";

  function poll() {
    const proxyUrl = `https://my-stream-proxy.jdsjeo.workers.dev/?url=https://rvdkewwyycep.ap-southeast-1.clawcloudrun.com/api/status?id=${encodeURIComponent(ytid)}`;

    fetch(proxyUrl)
      .then(res => res.text())
      .then(text => {
        if (text !== previousText) {
          // Only update if new lines have appeared
          const newText = text.slice(previousText.length);
          logElement.value += newText;
          logElement.scrollTop = logElement.scrollHeight;
          previousText = text;
        }
      })
      .catch(err => {
        logElement.value += "\nError: " + err.message;
      });
  }

  setInterval(poll, 1000); // poll every 3 seconds
}