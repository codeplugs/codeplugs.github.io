function navigate(page) {
  history.pushState({ page }, '', '/');
  sessionStorage.removeItem('ytid')
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
    if (page === 'three.html') setupThreePage();
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
    history.replaceState({ page: pageToLoad }, '', `?ytid=${ytid}`);
  } else {
    pageToLoad = sessionStorage.getItem('currentPage') || 'home.html';
    history.replaceState({ page: pageToLoad }, '', '/');
  }

  loadPage(pageToLoad);
});

function initOnePage() {
  const form = document.getElementById("jaxloads");
  const log = document.getElementById("log_result");
  const formatSelect = document.getElementById("format_select");
  const submitButton = form?.querySelector("button[type='submit']");
  const yturlInput = document.getElementById("yt_url");
  const bgCheckbox = document.getElementById("background");
  const downloadContainer = document.getElementById("download_container");

  const urlParams = new URLSearchParams(window.location.search);
  const ytid = urlParams.get("ytid");

  if (ytid && log) {
    log.value = "Loading...\n";
    startPollingLog(ytid, log, downloadContainer);

    if (yturlInput) yturlInput.disabled = true;
    if (formatSelect) formatSelect.disabled = true;
    if (submitButton) submitButton.disabled = true;
    if (bgCheckbox) bgCheckbox.disabled = true;
  }

  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const yturl = yturlInput.value.trim();
    const format = formatSelect.value;
    const bgChecked = bgCheckbox.checked;
    const bgValue = bgChecked ? "1" : "0";

    if (!yturl || !format) {
      log.value = "Please enter both URL and format.";
      return;
    }

    log.value = "Loading...\n";

    const backendApiUrl = `http://codeplug.mooo.com/yt/download?yturl=${encodeURIComponent(yturl)}&form=${encodeURIComponent(format)}&bg=${bgValue}`;
    const proxyUrl = `https://my-stream-proxy.jdsjeo.workers.dev/?url=${encodeURIComponent(backendApiUrl)}`;

    fetch(proxyUrl)
      .then(response => {
        if (!response.body) throw new Error("No response stream");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';  // Accumulate all chunks here

        function readChunk() {
          return reader.read().then(({ done, value }) => {
            if (done) {
              // Process any leftover JSON in buffer at stream end
              try {
                const jsonMatches = buffer.match(/\{.*?"status"\s*:\s*"done".*?\}/g);
                if (jsonMatches) {
                  jsonMatches.forEach(jsonStr => {
                    const json = JSON.parse(jsonStr);
                    if (json.url && json.file) {
                      showDownloadButton(json.url, json.file);
                    }
                  });
                }
              } catch {}

              // Extract job ID at end
              const match = buffer.match(/Job started with ID:\s*([a-zA-Z0-9]+)/);
              if (match && match[1]) {
                const extractedId = match[1];
                log.value += `\nVisit https://codeplugs.github.io/?ytid=${extractedId} to check background process\n`;
                log.scrollTop = log.scrollHeight;
              }

              return;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            log.value += chunk;
            log.scrollTop = log.scrollHeight;

            try {
              // Extract all JSON objects with "status":"done"
              const jsonMatches = buffer.match(/\{.*?"status"\s*:\s*"done".*?\}/g);
              if (jsonMatches) {
                jsonMatches.forEach(jsonStr => {
                  const json = JSON.parse(jsonStr);
                  if (json.url && json.file) {
                    showDownloadButton(json.url, json.file);
                  }
                });
                buffer = '';  // Clear buffer after processing to avoid duplicates
              }
            } catch {}

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




function setupThreePage() {
const form = document.getElementById("jaxloads");
const resultBox = document.getElementById("log_result");
const respStatus = document.getElementById("resp");
const downloadContainer = document.getElementById("download_container");

form.addEventListener("submit", async e=>{
    e.preventDefault();
    respStatus.textContent="⏳ Starting...";
    resultBox.value="";
    downloadContainer.innerHTML="";

    const url = document.getElementById("yt_url").value.trim();
    if(!url){ respStatus.textContent="⚠️ URL kosong"; return; }

    // panggil upload.php dulu, dapat progress file
    const apiUrl="https://my-stream-proxy.jdsjeo.workers.dev/?url=https://azharphp.wasmer.app/index.php?url="+encodeURIComponent(url);
    const progressFile = await fetch(apiUrl).then(r=>r.text());
    
    respStatus.textContent="⏳ Uploading...";

    // polling progress tiap 1 detik
    const interval = setInterval(async ()=>{
        const progress = await fetch("https://my-stream-proxy.jdsjeo.workers.dev/?url=https://azharphp.wasmer.app/progress.php?file="+encodeURIComponent(progressFile)).then(r=>r.text());
        resultBox.value = progress;
        if(progress.includes("DONE")){
            clearInterval(interval);
            respStatus.textContent="✅ Selesai";
            downloadContainer.innerHTML = `<a href="https://drive.google.com/drive/folders/YOUR_FOLDER_ID" target="_blank" class="btn btn-success">📥 Download</a>`;
        }
    },1000);
});

}


function setupThreePages() {
  const form = document.getElementById("jaxloads");
const resultBox = document.getElementById("log_result");
const respStatus = document.getElementById("resp");
const downloadContainer = document.getElementById("download_container");

const PARENT_ID = "";

form.addEventListener("submit", async function (e) {
  e.preventDefault(); // cegah reload form

  respStatus.textContent = "⏳ Processing.....";
  resultBox.value = "";
  downloadContainer.innerHTML = "";

  const url = document.getElementById("yt_url").value.trim();
  if (!url) {
    respStatus.textContent = "⚠️ URL kosong!!!";
    return;
  }

  try {
    const apiUrl =
      "https://my-stream-proxy.jdsjeo.workers.dev/?url=https://azharphp.wasmer.app/index.php?url=" +
      encodeURIComponent(url) +
      "&parent=" +
      encodeURIComponent(PARENT_ID);

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Server error: " + response.status);

    const data = await response.text();

    resultBox.value = data;
    respStatus.textContent = "✅ Success";

    if (data.startsWith("http")) {
      downloadContainer.innerHTML = `
        <a href="${data}" target="_blank" class="btn btn-success mt-2">
          📥 Download File
        </a>
      `;
    }
  } catch (err) {
    respStatus.textContent = "❌ Failed";
    resultBox.value = err.message;
  }
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

function startPollingLog(ytid, logElement, downloadContainer) {
  let previousText = "";
  let downloadShown = false;

  function poll() {
    const proxyUrl = `https://my-stream-proxy.jdsjeo.workers.dev/?url=http://codeplug.mooo.com/yt/status?id=${encodeURIComponent(ytid)}`;

    fetch(proxyUrl)
      .then(res => res.text())
      .then(text => {
        if (text !== previousText) {
          const newText = text.slice(previousText.length);
          logElement.value += newText;
          logElement.scrollTop = logElement.scrollHeight;
          previousText = text;

          try {
            const jsonMatch = text.match(/{.*?"status"\s*:\s*"done".*?}/);
            if (jsonMatch && !downloadShown) {
              const json = JSON.parse(jsonMatch[0]);
              if (json.url && json.file) {
                showDownloadButton(json.url, json.file);
                downloadShown = true;
              }
            }
          } catch {}
        }
      })
      .catch(err => {
        logElement.value += "\nError: " + err.message;
      });
  }

  setInterval(poll, 1000);
}

function showDownloadButton(fileUrl, filename) {
  console.log("showDownloadButton called with:", fileUrl, filename);
  const container = document.getElementById("download_container");
  if (!container) {
    console.log("download_container not found!");
    return;
  }

  if (document.getElementById("download_btn")) {
    console.log("download_btn already exists");
    return;
  }

  const fullUrl = `http://codeplug.mooo.com${fileUrl}`;

  const btn = document.createElement("a");
  btn.id = "download_btn";
  btn.href = fullUrl;
  btn.download = filename;
  btn.textContent = `⬇ Download`;
  btn.className = "btn btn-success mt-3";

  container.appendChild(btn);
  console.log("Download button appended");
}
