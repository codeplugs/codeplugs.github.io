document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  loadPage('home.html'); // Load default page
});

async function loadPage(file, link = null) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error('Network response not ok');
    const html = await res.text();
    document.getElementById('app').innerHTML = html;

    // Set active nav link styling
    document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
    if (link) link.classList.add('active');

    // Update page title (optional)
    document.title = 'MySite - ' + file.replace('.html', '').toUpperCase();
  } catch (err) {
    document.getElementById('app').innerHTML = `
      <div class="alert alert-danger">Error loading page: ${file}</div>
    `;
  }
}