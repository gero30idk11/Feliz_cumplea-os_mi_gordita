const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRp80A5vVYeOZDcBrDCTsoBZDC7ZfyvhIgRJ4InkcbgcsJ90muDVhthWGuDsElJ677VlD-mYTjfRecZ/pub?output=csv';

/* ══════════════════════════════════════
   CANVAS — ESTRELLAS + POLVO MÁGICO
   ══════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, stars = [], dust = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Estrellas
  for (let i = 0; i < 160; i++) {
    stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.6 + .3,
      speed: Math.random() * .4 + .05,
      phase: Math.random() * Math.PI * 2,
      silver: Math.random() > .6
    });
  }
  // Polvo mágico
  for (let i = 0; i < 55; i++) {
    dust.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2.5 + .5,
      vx: (Math.random() - .5) * .25,
      vy: (Math.random() - .5) * .18,
      alpha: Math.random() * .5 + .1,
      phase: Math.random() * Math.PI * 2
    });
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += .012;

    // Estrellas
    stars.forEach(s => {
      const alpha = .3 + .7 * Math.abs(Math.sin(s.phase + t * s.speed));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      if (s.silver) {
        ctx.fillStyle = `rgba(226,232,240,${alpha})`;
      } else {
        ctx.fillStyle = `rgba(196,181,253,${alpha * .8})`;
      }
      ctx.fill();
      // Destello en estrellas grandes
      if (s.r > 1.2 && alpha > .85) {
        ctx.beginPath();
        ctx.moveTo(s.x - s.r * 3, s.y);
        ctx.lineTo(s.x + s.r * 3, s.y);
        ctx.moveTo(s.x, s.y - s.r * 3);
        ctx.lineTo(s.x, s.y + s.r * 3);
        ctx.strokeStyle = `rgba(226,232,240,${alpha * .3})`;
        ctx.lineWidth = .5;
        ctx.stroke();
      }
    });

    // Polvo mágico
    dust.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
      if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
      const a = d.alpha * (.5 + .5 * Math.sin(d.phase + t * .5));
      const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 2);
      grad.addColorStop(0, `rgba(196,181,253,${a})`);
      grad.addColorStop(1, `rgba(168,85,247,0)`);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r * 2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════
   MARIPOSAS
   ══════════════════════════════════════ */
const BUTTERFLY_EMOJIS = ['🦋','🦋','🦋','✨','💫'];
const MAX_BUTTERFLIES  = 7;

function spawnButterfly() {
  if (document.querySelectorAll('.butterfly').length >= MAX_BUTTERFLIES) return;
  const b   = document.createElement('div');
  b.className = 'butterfly';
  b.textContent = BUTTERFLY_EMOJIS[Math.floor(Math.random() * BUTTERFLY_EMOJIS.length)];
  const size = 0.8 + Math.random() * 1.2;
  const dur  = 18 + Math.random() * 20;
  const startX = Math.random() * window.innerWidth;
  const startY = Math.random() * window.innerHeight;
  const dx1 = (Math.random() - .5) * 300, dy1 = (Math.random() - .5) * 250;
  const dx2 = (Math.random() - .5) * 400, dy2 = (Math.random() - .5) * 300;
  const dx3 = (Math.random() - .5) * 500, dy3 = (Math.random() - .5) * 400;

  b.style.cssText = `
    left: ${startX}px; top: ${startY}px;
    font-size: ${size}rem;
    opacity: 0.75;
    animation-duration: ${dur}s;
    animation-delay: ${Math.random() * 5}s;
    --dx1:${dx1}px; --dy1:${dy1}px; --r1:${(Math.random()-0.5)*40}deg;
    --dx2:${dx2}px; --dy2:${dy2}px; --r2:${(Math.random()-0.5)*60}deg;
    --dx3:${dx3}px; --dy3:${dy3}px; --r3:${(Math.random()-0.5)*80}deg;
  `;
  document.body.appendChild(b);
  setTimeout(() => b.remove(), (dur + 5) * 1000);
}

for (let i = 0; i < 5; i++) setTimeout(spawnButterfly, i * 1200);
setInterval(spawnButterfly, 4000);

/* ══════════════════════════════════════
   PANTALLA DE BIENVENIDA
   ══════════════════════════════════════ */
function enterPage() {
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('main-content').classList.add('visible');
  setTimeout(animateCards, 350);
  // Mostrar sección final después de un delay largo
  setTimeout(() => {
    const fs = document.getElementById('final-section');
    if (fs) fs.classList.add('visible');
  }, 3500);
}

/* ══════════════════════════════════════
   ANIMACIÓN DE ENTRADA DE CARTAS
   ══════════════════════════════════════ */
function animateCards() {
  document.querySelectorAll('.card-container').forEach((card, i) => {
    setTimeout(() => card.classList.add('card-visible'), i * 180);
  });
}

/* ══════════════════════════════════════
   VIBRACIÓN HÁPTICA
   ══════════════════════════════════════ */
function haptic() {
  if (navigator.vibrate) navigator.vibrate([25, 15, 55]);
}

/* ══════════════════════════════════════
   PARTÍCULAS AL ABRIR SOBRE
   ══════════════════════════════════════ */
function burstParticles(el) {
  const rect   = el.getBoundingClientRect();
  const cx     = rect.left + rect.width / 2;
  const cy     = rect.top  + rect.height / 2;
  const syms   = ['✨','💜','⭐','🌟','💫','🦋','💕'];
  for (let i = 0; i < 10; i++) {
    const p  = document.createElement('div');
    p.className = 'burst-particle';
    p.textContent = syms[Math.floor(Math.random() * syms.length)];
    const angle = (Math.PI * 2 * i) / 10 + Math.random() * .5;
    const dist  = 60 + Math.random() * 80;
    p.style.cssText = `
      left:${cx}px; top:${cy}px;
      --bx:${Math.cos(angle)*dist}px;
      --by:${Math.sin(angle)*dist}px;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 950);
  }
}

/* ══════════════════════════════════════
   CSV PARSER
   ══════════════════════════════════════ */
function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const arr = [];
    let inQuotes = false, item = '';
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { arr.push(item.trim()); item = ''; continue; }
      item += ch;
    }
    arr.push(item.trim());
    rows.push(arr);
  }
  return rows;
}

function fixDriveImageLink(url) {
  if (!url) return '';
  const clean = url.replace(/"/g, '').trim();
  const match = clean.match(/(?:file\/d\/|id=)([a-zA-Z0-9_-]+)/);
  return match ? `https://lh3.googleusercontent.com/d/${match[1]}` : clean;
}

function getYouTubeId(url) {
  const clean = url.replace(/"/g, '').trim();
  const m = clean.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getSpotifyEmbed(url) {
  const clean = url.replace(/"/g, '').trim();
  const m = clean.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0` : null;
}

function ytThumb(id) { return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`; }

/* ══════════════════════════════════════
   CREAR ÍTEM (imagen / texto)
   ══════════════════════════════════════ */
function createItemHTML(item) {
  const tipo = (item.tipo || '').toLowerCase().trim();
  const tituloHtml = item.titulo ? `<h3 class="item-title">${item.titulo}</h3>` : '';

  if (tipo === 'texto') {
    return `<div class="carousel-item">
      <div class="content-text-block">${tituloHtml}<p>${item.url.replace(/"/g,'')}</p></div>
    </div>`;
  }
  if (tipo === 'imagen') {
    const src = fixDriveImageLink(item.url);
    return `<div class="carousel-item">
      <div class="content-image-block">${tituloHtml}
        <img src="${src}" alt="${item.titulo||'Imagen'}" loading="lazy"
             onload="this.classList.add('loaded')"
             onerror="this.classList.add('loaded')">
      </div>
    </div>`;
  }
  return '';
}

/* ══════════════════════════════════════
   PLAYLIST VISUAL
   ══════════════════════════════════════ */
function buildPlaylistHTML(items) {
  const tracks = items.map((item, idx) => {
    const clean   = item.url.replace(/"/g,'').trim();
    const ytId    = getYouTubeId(clean);
    const spEmbed = getSpotifyEmbed(clean);
    const name    = item.tituloCancion || item.titulo || `Canción ${idx+1}`;
    let thumb = '', platform = '', embedUrl = '';

    if (ytId) {
      thumb = ytThumb(ytId); platform = 'youtube';
      embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
    } else if (spEmbed) {
      thumb = 'https://i.imgur.com/6gY9xgW.png'; platform = 'spotify'; embedUrl = spEmbed;
    } else {
      thumb = 'https://i.imgur.com/6gY9xgW.png'; platform = 'link'; embedUrl = clean;
    }

    return `<div class="sp-track" data-embed="${embedUrl}" data-platform="${platform}">
      <span class="sp-track-num">${idx+1}</span>
      <img class="sp-track-thumb" src="${thumb}" alt="" loading="lazy"
           onerror="this.src='https://i.imgur.com/6gY9xgW.png'">
      <div class="sp-track-info">
        <span class="sp-track-name">${name}</span>
        <span class="sp-track-platform ${platform}">
          ${platform==='youtube'?'▶ YouTube':platform==='spotify'?'♫ Spotify':'🔗 Link'}
        </span>
      </div>
      <span class="sp-track-play">▶</span>
    </div>`;
  });
  return `<div class="sp-playlist">${tracks.join('')}</div>`;
}

/* ══════════════════════════════════════
   MODAL
   ══════════════════════════════════════ */
const modal      = document.getElementById('video-modal');
const modalBody  = document.getElementById('modal-body');
const closeBtnEl = document.getElementById('close-modal');
let userWantsSound = false;

function getVideoBg() { return document.getElementById('bg-video'); }

function toggleSound() {
  const v = getVideoBg(), btn = document.getElementById('sound-btn');
  if (!v) return;
  userWantsSound = !userWantsSound;
  v.muted = !userWantsSound;
  btn.textContent = userWantsSound ? '🔊' : '🔇';
}

function muteVideoBg()   { const v=getVideoBg(); if(v) v.muted=true; }
function unmuteVideoBg() { const v=getVideoBg(); if(v&&userWantsSound) v.muted=false; }

function openModal(embedUrl, platform) {
  if (platform === 'link') { window.open(embedUrl, '_blank'); return; }
  muteVideoBg();
  modalBody.innerHTML = `<iframe src="${embedUrl}" width="100%" height="280" frameborder="0"
    allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
  </iframe>`;
  modal.classList.add('active');
}

function closeModalFn() {
  modal.classList.remove('active');
  modalBody.innerHTML = '';
  unmuteVideoBg();
}

closeBtnEl.addEventListener('click', closeModalFn);
modal.addEventListener('click', e => { if(e.target===modal) closeModalFn(); });
document.addEventListener('keydown', e => { if(e.key==='Escape') closeModalFn(); });

/* ══════════════════════════════════════
   CARGAR TARJETAS
   ══════════════════════════════════════ */
async function loadCards() {
  const grid = document.getElementById('cards-grid');
  try {
    const res  = await fetch(csvUrl);
    const text = await res.text();
    const rows = parseCSV(text);

    const cardsMap = new Map();
    rows.forEach(row => {
      const name = (row[0]||'').trim();
      if (!name) return;
      if (!cardsMap.has(name)) cardsMap.set(name, []);
      cardsMap.get(name).push({
        tipo:          row[1]||'',
        titulo:        row[2]||'',
        tituloCancion: row[3]||'',
        url:           row[4]||''
      });
    });

    grid.innerHTML = '';

    cardsMap.forEach((items, cardName) => {
      const tipos      = items.map(i => i.tipo.toLowerCase().trim());
      const isPlaylist = tipos.some(t => t === 'playlist');
      const isSpotify  = tipos.some(t => t === 'spotify');
      const cardBox    = document.createElement('div');
      cardBox.className = 'card-container';

      let contentHTML = '';

      if (isSpotify) {
        const cardTitle = items.find(i=>i.titulo)?.titulo || cardName;

        // Construir botones según la URL de cada fila
        const buttons = items.map(item => {
          const url   = item.url.trim();
          const isYT  = url.includes('youtube.com') || url.includes('youtu.be');
          const isSP  = url.includes('spotify.com');
          if (isYT) return `
            <a class="spotify-link-btn yt-btn" href="${url}" target="_blank" rel="noopener noreferrer">
              ▶ Abrir en YouTube
            </a>`;
          if (isSP) return `
            <a class="spotify-link-btn" href="${url}" target="_blank" rel="noopener noreferrer">
              ♫ Abrir en Spotify
            </a>`;
          return `
            <a class="spotify-link-btn" href="${url}" target="_blank" rel="noopener noreferrer">
              🔗 Abrir enlace
            </a>`;
        }).join('');

        contentHTML = `<div class="spotify-link-card">
          <div class="spotify-link-icon">🎧</div>
          <h3 class="spotify-link-title">${cardTitle}</h3>
          <p class="spotify-link-desc">Te compartí una playlist especial.<br>Guárdala y escúchala cuando me extrañes 💚</p>
          <div class="playlist-btns">${buttons}</div>
        </div>`;
      } else if (isPlaylist) {
        const cardTitle = items.find(i=>i.titulo)?.titulo || cardName;
        contentHTML = `<h3 class="item-title playlist-title"><span class="playlist-icon">🎵</span> ${cardTitle}</h3>
          ${buildPlaylistHTML(items)}`;
      } else {
        const itemsHTML = items.map(i => createItemHTML(i)).join('');
        const hint = items.length > 1 ? `<div class="carousel-hint">← Desliza para ver más →</div>` : '';
        contentHTML = `<div class="carousel-container"><div class="carousel-track">${itemsHTML}</div></div>${hint}`;
      }

      cardBox.innerHTML = `
        <div class="envelope">
          <div class="envelope-inner">
            <div class="letter">${contentHTML}</div>
            <div class="envelope-front">
              <h2 class="card-title-front">${cardName}</h2>
            </div>
            <div class="envelope-flap">
              <div class="heart-seal">❤️</div>
            </div>
          </div>
        </div>`;

      // Abrir carta
      cardBox.addEventListener('click', function(e) {
        if (cardBox.classList.contains('opened')) return;
        document.querySelectorAll('.card-container.opened').forEach(c => {
          c.classList.remove('opened');
          c.querySelectorAll('iframe').forEach(f => { f.src = ''; });
        });
        cardBox.classList.add('opened');
        haptic();
        burstParticles(cardBox.querySelector('.envelope'));
      });

      // Click en track → modal
      cardBox.addEventListener('click', function(e) {
        const track = e.target.closest('.sp-track');
        if (!track || !cardBox.classList.contains('opened')) return;
        e.stopPropagation();
        openModal(track.dataset.embed, track.dataset.platform);
      });

      grid.appendChild(cardBox);
    });

  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="loading" style="color:#fca5a5">
      Error al cargar las sorpresas. Revisa tu enlace del Sheet.
    </div>`;
  }
}

window.addEventListener('DOMContentLoaded', loadCards);
