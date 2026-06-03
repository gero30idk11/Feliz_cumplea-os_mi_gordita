const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRp80A5vVYeOZDcBrDCTsoBZDC7ZfyvhIgRJ4InkcbgcsJ90muDVhthWGuDsElJ677VlD-mYTjfRecZ/pub?output=csv';

function parseCSV(text) {
    let lines = text.split(/\r?\n/);
    let rows = [];
    for (let i = 1; i < lines.length; i++) {
        let line = lines[i];
        if (!line.trim()) continue;
        let arr = [];
        let inQuotes = false;
        let item = '';
        for (let j = 0; j < line.length; j++) {
            let char = line[j];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) { arr.push(item.trim()); item = ''; }
            else item += char;
        }
        arr.push(item.trim());
        rows.push(arr);
    }
    return rows;
}

// NUEVO: Función para arreglar links de imágenes de Google Drive
function fixDriveImageLink(url) {
    if (!url) return '';
    let cleanUrl = url.replace(/"/g, '').trim();
    // Extrae el ID del enlace de Drive (sirve para enlaces con /file/d/ o ?id=)
    const driveRegex = /(?:file\/d\/|id=)([a-zA-Z0-9_-]+)/;
    const match = cleanUrl.match(driveRegex);
    
    if (match && match[1]) {
        // Convierte el link a modo "Descarga Directa" para que HTML lo pueda leer como imagen
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    return cleanUrl;
}

function getEmbedUrl(url) {
    if (!url) return '';
    let cleanUrl = url.replace(/"/g, '').trim();
    if (cleanUrl.includes('spotify.com')) {
        return cleanUrl.replace('/track/', '/embed/track/').replace('/playlist/', '/embed/playlist/');
    }
    if (cleanUrl.includes('youtube.com/watch')) {
        try {
            const urlParams = new URLSearchParams(cleanUrl.split('?')[1]);
            return `https://www.youtube.com/embed/${urlParams.get('v')}`;
        } catch(e) { return cleanUrl; }
    }
    if (cleanUrl.includes('youtu.be/')) {
        const id = cleanUrl.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
    }
    return cleanUrl;
}

function createItemHTML(item) {
    const tipo = item.tipo.toLowerCase().trim();
    const tituloHtml = item.titulo ? `<h3 class="item-title">${item.titulo}</h3>` : '';
    
    if (tipo === 'texto') {
        return `
            <div class="carousel-item">
                <div class="content-text-block">
                    ${tituloHtml}
                    <p>${item.url.replace(/"/g, '')}</p>
                </div>
            </div>
        `;
    } else if (tipo === 'imagen') {
        // Aplicamos la corrección de Google Drive aquí y Lazy Loading
        const imageUrl = fixDriveImageLink(item.url);
        return `
            <div class="carousel-item">
                <div class="content-image-block">
                    ${tituloHtml}
                    <img src="${imageUrl}" alt="${item.titulo || 'Imagen'}" loading="lazy">
                </div>
            </div>
        `;
    } else if (tipo === 'playlist') {
        const embedUrl = getEmbedUrl(item.url);
        // MEJORA DE VELOCIDAD: Usamos data-src en lugar de src.
        // El iframe no se cargará hasta que se abra la carta.
        return `
            <div class="carousel-item">
                <div class="content-playlist-block" style="width: 100%;">
                    ${tituloHtml}
                    <iframe data-src="${embedUrl}" width="100%" height="300" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                </div>
            </div>
        `;
    }
    return '';
}

async function loadCards() {
    const grid = document.getElementById('cards-grid');
    try {
        const response = await fetch(csvUrl);
        const dataText = await response.text();
        const rows = parseCSV(dataText);
        
        const cardsMap = {};
        rows.forEach(row => {
            const cardName = row[0];
            const tipo = row[1];
            const titulo = row[2];
            const url = row[3];
            
            if (!cardName) return;
            if (!cardsMap[cardName]) cardsMap[cardName] = [];
            cardsMap[cardName].push({ tipo, titulo, url });
        });
        
        grid.innerHTML = ''; 
        
        Object.keys(cardsMap).forEach(cardName => {
            const items = cardsMap[cardName];
            const cardBox = document.createElement('div');
            cardBox.className = 'card-container';
            
            let itemsHTML = items.map(item => createItemHTML(item)).join('');
            let hintHTML = items.length > 1 ? `<div class="carousel-hint">← Desliza la carta para ver más →</div>` : '';
            
            // Nueva estructura HTML del sobre
            cardBox.innerHTML = `
                <div class="envelope">
                    <div class="envelope-inner">
                        <div class="letter">
                            <div class="carousel-container">
                                <div class="carousel-track">
                                    ${itemsHTML}
                                </div>
                            </div>
                            ${hintHTML}
                        </div>
                        
                        <div class="envelope-front">
                            <h2 class="card-title-front">${cardName}</h2>
                        </div>
                        
                        <div class="envelope-flap">
                            <div class="heart-seal">❤️</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Evento al abrir la carta
            cardBox.addEventListener('click', function() {
                if (cardBox.classList.contains('opened')) return;
                cardBox.classList.add('opened');
                
                // MEJORA DE VELOCIDAD: Cargar iframes (Spotify/YouTube) solo al abrir la carta
                const iframes = cardBox.querySelectorAll('iframe[data-src]');
                iframes.forEach(iframe => {
                    iframe.src = iframe.getAttribute('data-src');
                    iframe.removeAttribute('data-src'); // Evita que se vuelva a cargar
                });
            });
            
            grid.appendChild(cardBox);
        });
        
    } catch (error) {
        console.error(error);
        grid.innerHTML = `<div class="loading" style="color: #fca5a5;">Error al cargar las sorpresas. Revisa tu enlace de Excel.</div>`;
    }
}

window.addEventListener('DOMContentLoaded', loadCards);
