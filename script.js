const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRp80A5vVYeOZDcBrDCTsoBZDC7ZfyvhIgRJ4InkcbgcsJ90muDVhthWGuDsElJ677VlD-mYTjfRecZ/pub?output=csv';

/* ── CSV parser ── */
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

/* ── Fix Google Drive links ── */
function fixDriveImageLink(url) {
    if (!url) return '';
    const clean = url.replace(/"/g, '').trim();
    const match = clean.match(/(?:file\/d\/|id=)([a-zA-Z0-9_-]+)/);
    return match ? `https://lh3.googleusercontent.com/d/${match[1]}` : clean;
}

/* ── Extraer ID de YouTube ── */
function getYouTubeId(url) {
    const clean = url.replace(/"/g, '').trim();
    const m = clean.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
}

/* ── Extraer ID/tipo de Spotify ── */
function getSpotifyEmbed(url) {
    const clean = url.replace(/"/g, '').trim();
    const m = clean.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0` : null;
}

/* ── Thumbnail YouTube ── */
function ytThumb(id) {
    return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

/* ── Crear HTML de un ítem ── */
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

    // playlist → se maneja aparte como lista entera, no por ítem
    return '';
}

/* ── Construir lista estilo Spotify para playlist ── */
function buildPlaylistHTML(items) {
    // items = array de { tipo, titulo, url }
    // todos tipo playlist; titulo de la carta viene del primero
    const tracks = items.map((item, idx) => {
        const clean = item.url.replace(/"/g,'').trim();
        const ytId  = getYouTubeId(clean);
        const spEmbed = getSpotifyEmbed(clean);

        let thumb = '', platform = '', embedUrl = '', trackName = item.titulo || `Canción ${idx+1}`;

        if (ytId) {
            thumb    = ytThumb(ytId);
            platform = 'youtube';
            embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
            trackName = item.titulo || `Canción ${idx+1}`;
        } else if (spEmbed) {
            thumb    = 'https://i.imgur.com/6gY9xgW.png'; // nota musical genérica
            platform = 'spotify';
            embedUrl = spEmbed;
            trackName = item.titulo || `Canción ${idx+1}`;
        } else {
            thumb    = 'https://i.imgur.com/6gY9xgW.png';
            platform = 'link';
            embedUrl = clean;
            trackName = item.titulo || clean;
        }

        return `
        <div class="sp-track" data-embed="${embedUrl}" data-platform="${platform}">
            <span class="sp-track-num">${idx+1}</span>
            <img class="sp-track-thumb" src="${thumb}" alt="" loading="lazy" onerror="this.src='https://i.imgur.com/6gY9xgW.png'">
            <div class="sp-track-info">
                <span class="sp-track-name">${trackName}</span>
                <span class="sp-track-platform ${platform}">${platform === 'youtube' ? '▶ YouTube' : platform === 'spotify' ? '♫ Spotify' : '🔗 Link'}</span>
            </div>
            <span class="sp-track-play">▶</span>
        </div>`;
    });

    return `<div class="sp-playlist">${tracks.join('')}</div>`;
}

/* ── Modal ── */
const modal      = document.getElementById('video-modal');
const modalBody  = document.getElementById('modal-body');
const closeModal = document.getElementById('close-modal');

function openModal(embedUrl, platform) {
    if (platform === 'link') { window.open(embedUrl, '_blank'); return; }
    modalBody.innerHTML = `<iframe src="${embedUrl}" 
        width="100%" height="280" frameborder="0" allowfullscreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
    </iframe>`;
    modal.classList.add('active');
}

function closeModalFn() {
    modal.classList.remove('active');
    modalBody.innerHTML = '';
}

closeModal.addEventListener('click', closeModalFn);
modal.addEventListener('click', e => { if(e.target === modal) closeModalFn(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModalFn(); });

/* ── Cargar tarjetas ── */
async function loadCards() {
    const grid = document.getElementById('cards-grid');
    try {
        const res  = await fetch(csvUrl);
        const text = await res.text();
        const rows = parseCSV(text);

        // Agrupar por carta (columna 0)
        const cardsMap = new Map();
        rows.forEach(row => {
            const name = (row[0] || '').trim();
            if (!name) return;
            if (!cardsMap.has(name)) cardsMap.set(name, []);
            cardsMap.get(name).push({ tipo: row[1]||'', titulo: row[2]||'', url: row[3]||'' });
        });

        grid.innerHTML = '';

        cardsMap.forEach((items, cardName) => {
            const isPlaylist = items.some(i => i.tipo.toLowerCase().trim() === 'playlist');
            const cardBox = document.createElement('div');
            cardBox.className = 'card-container';

            let contentHTML = '';

            if (isPlaylist) {
                // Toda la carta es una playlist
                const cardTitle = items.find(i=>i.titulo)?.titulo || cardName;
                contentHTML = `
                    <h3 class="item-title playlist-title">
                        <span class="playlist-icon">🎵</span> ${cardTitle}
                    </h3>
                    ${buildPlaylistHTML(items)}`;
            } else {
                // Carousel de imágenes/texto
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
            cardBox.addEventListener('click', function(e) {
                // Si ya está abierta, solo procesar clicks en tracks
                if (cardBox.classList.contains('opened')) return;

                // Cerrar otras
                document.querySelectorAll('.card-container.opened').forEach(c => {
                    c.classList.remove('opened');
                    c.querySelectorAll('iframe').forEach(f => { f.src = ''; });
                });

                cardBox.classList.add('opened');

                // Activar iframes lazy de playlists embed (no usamos aquí, usamos modal)
                cardBox.querySelectorAll('iframe[data-src]').forEach(f => {
                    f.src = f.dataset.src;
                    delete f.dataset.src;
                });
            });

            // Click en track de playlist → abrir modal
            cardBox.addEventListener('click', function(e) {
                const track = e.target.closest('.sp-track');
                if (!track) return;
                e.stopPropagation();
                if (!cardBox.classList.contains('opened')) return;
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
