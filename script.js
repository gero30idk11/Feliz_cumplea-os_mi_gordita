const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRp80A5vVYeOZDcBrDCTsoBZDC7ZfyvhIgRJ4InkcbgcsJ90muDVhthWGuDsElJ677VlD-mYTjfRecZ/pub?output=csv';

// ESTRUCTURA DEL SHEET:
// A: Carta | B: Tipo | C: Titulo (carta) | D: Titulo cancion | E: Url

/* ══ 1. PANTALLA DE BIENVENIDA ══ */
function enterPage() {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('main-content').classList.add('visible');
    // Las cartas ya están en el DOM, solo las animamos
    setTimeout(animateCards, 300);
}

/* ══ 5. ANIMACIÓN ENTRADA DE CARTAS ══ */
function animateCards() {
    document.querySelectorAll('.card-container').forEach((card, i) => {
        setTimeout(() => card.classList.add('card-visible'), i * 150);
    });
}

/* ══ 3. CONTADOR ══ */
let totalCards = 0, openedCards = 0;
function updateCounter() {
    const el = document.getElementById('card-counter');
    if (!el || totalCards === 0) return;
    if (openedCards === 0)           el.textContent = `${totalCards} sorpresas te esperan 💜`;
    else if (openedCards === totalCards) el.textContent = `¡Abriste todas las sorpresas! 🎉`;
    else el.textContent = `Abriste ${openedCards} de ${totalCards} sorpresas 💜`;
}

/* ══ 9. VIBRACIÓN HÁPTICA ══ */
function haptic() {
    if (navigator.vibrate) navigator.vibrate([30, 20, 60]);
}

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

function ytThumb(id) {
    return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

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
                <img src="${src}" alt="${item.titulo||'Imagen'}" loading="lazy">
            </div>
        </div>`;
    }
    return '';
}

function buildPlaylistHTML(items) {
    const tracks = items.map((item, idx) => {
        const clean     = item.url.replace(/"/g,'').trim();
        const ytId      = getYouTubeId(clean);
        const spEmbed   = getSpotifyEmbed(clean);

        // ← usa item.tituloCancion (col D) como nombre de la canción
        const trackName = item.tituloCancion || item.titulo || `Canción ${idx + 1}`;

        let thumb = '', platform = '', embedUrl = '';

        if (ytId) {
            thumb    = ytThumb(ytId);
            platform = 'youtube';
            embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
        } else if (spEmbed) {
            thumb    = 'https://i.imgur.com/6gY9xgW.png';
            platform = 'spotify';
            embedUrl = spEmbed;
        } else {
            thumb    = 'https://i.imgur.com/6gY9xgW.png';
            platform = 'link';
            embedUrl = clean;
        }

        return `
        <div class="sp-track" data-embed="${embedUrl}" data-platform="${platform}">
            <span class="sp-track-num">${idx + 1}</span>
            <img class="sp-track-thumb" src="${thumb}" alt="" loading="lazy"
                 onerror="this.src='https://i.imgur.com/6gY9xgW.png'">
            <div class="sp-track-info">
                <span class="sp-track-name">${trackName}</span>
                <span class="sp-track-platform ${platform}">
                    ${platform === 'youtube' ? '▶ YouTube' : platform === 'spotify' ? '♫ Spotify' : '🔗 Link'}
                </span>
            </div>
            <span class="sp-track-play">▶</span>
        </div>`;
    });

    return `<div class="sp-playlist">${tracks.join('')}</div>`;
}

/* ── Modal ── */
const modal     = document.getElementById('video-modal');
const modalBody = document.getElementById('modal-body');
const closeBtnEl = document.getElementById('close-modal');

function getVideoBg() {
    return document.getElementById('bg-video');
}

// Estado: el usuario quiere sonido o no
let userWantsSound = false;

function toggleSound() {
    const v = getVideoBg();
    const btn = document.getElementById('sound-btn');
    if (!v) return;
    userWantsSound = !userWantsSound;
    v.muted = !userWantsSound;
    btn.textContent = userWantsSound ? '🔊' : '🔇';
}

function muteVideoBg() {
    const v = getVideoBg();
    if (v) v.muted = true;
}

function unmuteVideoBg() {
    const v = getVideoBg();
    // Solo desmutea si el usuario eligió tener sonido
    if (v && userWantsSound) v.muted = false;
}

function openModal(embedUrl, platform) {
    if (platform === 'link') { window.open(embedUrl, '_blank'); return; }
    muteVideoBg();
    modalBody.innerHTML = `<iframe src="${embedUrl}"
        width="100%" height="280" frameborder="0" allowfullscreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
    </iframe>`;
    modal.classList.add('active');
}

function closeModalFn() {
    modal.classList.remove('active');
    modalBody.innerHTML = '';
    unmuteVideoBg();
}

closeBtnEl.addEventListener('click', closeModalFn);
modal.addEventListener('click', e => { if (e.target === modal) closeModalFn(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModalFn(); });

/* ── Cargar tarjetas ── */
async function loadCards() {
    const grid = document.getElementById('cards-grid');
    try {
        const res  = await fetch(csvUrl);
        const text = await res.text();
        const rows = parseCSV(text);

        const cardsMap = new Map();
        rows.forEach(row => {
            const name = (row[0] || '').trim();
            if (!name) return;
            if (!cardsMap.has(name)) cardsMap.set(name, []);
            cardsMap.get(name).push({
                tipo:          row[1] || '',
                titulo:        row[2] || '',
                tituloCancion: row[3] || '',
                url:           row[4] || ''
            });
        });

        grid.innerHTML = '';
        totalCards = cardsMap.size;
        updateCounter();

        cardsMap.forEach((items, cardName) => {
            const tipos = items.map(i => i.tipo.toLowerCase().trim());
            const isPlaylist = tipos.some(t => t === 'playlist');
            const isSpotify  = tipos.some(t => t === 'spotify');
            const cardBox = document.createElement('div');
            cardBox.className = 'card-container';

            let contentHTML = '';

            if (isSpotify) {
                const first     = items[0];
                const cardTitle = first.titulo || cardName;
                const url       = first.url.trim();
                contentHTML = `
                    <div class="spotify-link-card">
                        <div class="spotify-link-icon">🎧</div>
                        <h3 class="spotify-link-title">${cardTitle}</h3>
                        <p class="spotify-link-desc">Te compartí una playlist especial.<br>Guárdala en tu Spotify 💚</p>
                        <a class="spotify-link-btn" href="${url}" target="_blank" rel="noopener noreferrer">
                            Abrir en Spotify
                        </a>
                    </div>`;
            } else if (isPlaylist) {
                const cardTitle = items.find(i => i.titulo)?.titulo || cardName;
                contentHTML = `
                    <h3 class="item-title playlist-title">
                        <span class="playlist-icon">🎵</span> ${cardTitle}
                    </h3>
                    ${buildPlaylistHTML(items)}`;
            } else {
                const itemsHTML = items.map(i => createItemHTML(i)).join('');
                const hint = items.length > 1
                    ? `<div class="carousel-hint">← Desliza para ver más →</div>` : '';
                contentHTML = `
                    <div class="carousel-container">
                        <div class="carousel-track">${itemsHTML}</div>
                    </div>${hint}`;
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
            cardBox.addEventListener('click', function (e) {
                if (cardBox.classList.contains('opened')) return;
                document.querySelectorAll('.card-container.opened').forEach(c => {
                    c.classList.remove('opened');
                    c.querySelectorAll('iframe').forEach(f => { f.src = ''; });
                });
                cardBox.classList.add('opened');
                haptic();
                openedCards++;
                updateCounter();
            });

            // Click en track → modal
            cardBox.addEventListener('click', function (e) {
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
