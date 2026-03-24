// ── MATRIX RAIN ───────────────────────────────────────────────────────────
(function () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&<>/\\[]{}=+-';
  const fontSize = 13;

  function createCanvas(side) {
    const canvas = document.createElement('canvas');
    canvas.classList.add('matrix-canvas');
    canvas.dataset.side = side;
    document.body.appendChild(canvas);
    return canvas;
  }

  function initMatrix(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const cols = Math.floor(width / fontSize);
    const drops = Array(cols).fill(1);

    function draw() {
      ctx.fillStyle = 'rgba(10,10,10,0.05)';
      ctx.fillRect(0, 0, width, canvas.height);
      ctx.font = fontSize + 'px "Share Tech Mono", monospace';

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const brightness = Math.random() > 0.95 ? '#ffffff' : (Math.random() > 0.5 ? '#00ff41' : '#008833');
        ctx.fillStyle = brightness;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }

    return draw;
  }

  const left  = createCanvas('left');
  const right = createCanvas('right');

  function resize() {
    const sideWidth = Math.max(0, (window.innerWidth - 900) / 2);
    [left, right].forEach(c => {
      c.width  = sideWidth;
      c.height = window.innerHeight;
    });
  }

  resize();
  window.addEventListener('resize', resize);

  const drawLeft  = initMatrix(left);
  const drawRight = initMatrix(right);
  setInterval(() => { drawLeft(); drawRight(); }, 50);
})();

// ── LOADER ────────────────────────────────────────────────────────────────
(function () {
  const loader = document.getElementById('loader');
  const bar    = document.getElementById('loader-bar');
  const pct    = document.getElementById('loader-pct');

  let progress = 0;
  const duration = 1800; // ms total
  const interval = 30;   // ms per tick
  const steps = duration / interval;
  const increment = 100 / steps;

  const timer = setInterval(() => {
    progress = Math.min(progress + increment + (Math.random() * increment * 0.5), 100);
    const rounded = Math.floor(progress);
    bar.style.width = rounded + '%';
    pct.textContent = rounded + '%';

    if (progress >= 100) {
      clearInterval(timer);
      bar.style.width = '100%';
      pct.textContent = '100%';
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 650);
      }, 300);
    }
  }, interval);
})();

// ── EDIT THIS LIST to control which repos appear ──────────────────────────
const SHOW_REPOS = [
  'FitGame',
  'Sisifo',
  'MealTracker',
  // Add more personal repo names here
];

// ── OVERRIDE descriptions for GitHub repos (optional) ─────────────────────
const REPO_DESCRIPTIONS = {
  'FitGame':     'iOS fitness app using gamification and MVVM architecture to build sustainable workout habits through consistency and progress tracking.',
  'Sisifo':      'An experimental creative project exploring repetition and interactive digital storytelling — named after the myth of Sisyphus.',
  'MealTracker': 'A personal meal logging application for tracking nutrition and building healthier daily habits.',
};

// ── MANUAL CARDS for org/external repos not on your account ───────────────
const MANUAL_REPOS = [
  {
    name: 'ip-access-orlando',
    description: 'Full-stack web and mobile platform built with the City of Orlando to digitize their device loan program — improving access to technology for underserved communities.',
    language: 'JavaScript',
    stargazers_count: 1,
    html_url: 'https://github.com/ipaccess-valencia-g2/ip-access-orlando',
  },
  // Add more manual entries here if needed
];

// ── SCREENSHOTS: map repo name → image filename in your project folder ─────
// Example: 'my-repo': 'images/my-repo-screenshot.png'
const REPO_IMAGES = {
  'ip-access-orlando': 'connect_orlando_image.png',
  'FitGame': 'Image1.png',
  'Sisifo': 'sisifo_image.png',
  'MealTracker': 'meal_tracker_image.png',
  // 'repo-name-1': 'images/repo-name-1.png',
};
// ──────────────────────────────────────────────────────────────────────────

async function loadRepos() {
  const grid = document.getElementById('projects-grid');
  try {
    const res = await fetch('https://api.github.com/users/ceccontreras/repos?sort=updated&per_page=100'); // update username if your GitHub handle changes
    if (!res.ok) throw new Error('API error');
    const repos = await res.json();

    const fromGitHub = SHOW_REPOS
      .map(name => repos.find(r => r.name === name))
      .filter(Boolean);

    const filtered = [...fromGitHub, ...MANUAL_REPOS];

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="status-msg">NO REPOSITORIES FOUND_</div>';
      return;
    }

    grid.innerHTML = filtered.map((repo, i) => {
      const img = REPO_IMAGES[repo.name];
      const imgHTML = img
        ? `<div class="card-img-wrap">
             <img class="card-img" src="${img}" alt="${repo.name} screenshot" />
           </div>`
        : '';

      return `
        <div class="project-card" style="animation-delay:${i * 0.06}s">
          ${imgHTML}
          <div class="card-body">
            <div class="card-index">[${String(i+1).padStart(2,'0')}]</div>
            <div class="card-name">${repo.name}</div>
            <div class="card-desc">${REPO_DESCRIPTIONS[repo.name] || repo.description || 'No description provided.'}</div>
            <div class="card-meta">
              ${repo.language ? `<span class="card-lang">${repo.language}</span>` : ''}
              <span class="card-stars">★ ${repo.stargazers_count}</span>
              <a class="card-link" href="${repo.html_url}" target="_blank">VIEW →</a>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    grid.innerHTML = `<div class="status-msg">ERROR: COULD NOT FETCH REPOS. CHECK NETWORK<span>_</span></div>`;
  }
}

loadRepos();

// ── COLLAGE LIGHTBOX ───────────────────────────────────────────────────────
(function () {
  const overlay = document.createElement('div');
  overlay.id = 'collage-overlay';
  overlay.innerHTML = `
    <div id="collage-overlay-inner">
      <div id="collage-overlay-media"></div>
      <div id="collage-overlay-label"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  function show(cell) {
    const mediaEl = cell.querySelector('.collage-img');
    const labelEl = cell.querySelector('.collage-label');
    const container = overlay.querySelector('#collage-overlay-media');
    const label = overlay.querySelector('#collage-overlay-label');

    container.innerHTML = '';
    label.textContent = labelEl ? labelEl.textContent : '';

    if (mediaEl.tagName === 'VIDEO') {
      const vid = document.createElement('video');
      vid.id = 'collage-overlay-img';
      vid.autoplay = true;
      vid.controls = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.innerHTML = mediaEl.innerHTML;
      container.appendChild(vid);
    } else {
      const img = document.createElement('img');
      img.id = 'collage-overlay-img';
      img.src = mediaEl.src;
      img.alt = mediaEl.alt;
      container.appendChild(img);
    }

    overlay.classList.add('visible');
  }

  document.querySelectorAll('.collage-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const videoSrc = cell.dataset.video;
      if (videoSrc) {
        const labelEl = cell.querySelector('.collage-label');
        const container = overlay.querySelector('#collage-overlay-media');
        const label = overlay.querySelector('#collage-overlay-label');
        container.innerHTML = '';
        label.textContent = labelEl ? labelEl.textContent.replace(' ▶', '') : '';
        const vid = document.createElement('video');
        vid.id = 'collage-overlay-img';
        vid.controls = true;
        vid.autoplay = true;
        vid.muted = true;
        vid.loop = true;
        vid.playsInline = true;
        vid.innerHTML = `<source src="${videoSrc}" type="video/mp4" />`;
        container.appendChild(vid);
        overlay.classList.add('visible');
      } else {
        show(cell);
      }
    });
  });

  overlay.addEventListener('click', () => overlay.classList.remove('visible'));
})();