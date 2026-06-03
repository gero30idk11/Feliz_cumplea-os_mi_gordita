// Tu link directo obtenido de tu Google Sheets
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRp80A5vVYeOZDcBrDCTsoBZDC7ZfyvhIgRJ4InkcbgcsJ90muDVhthWGuDsElJ677VlD-mYTjfRecZ/pub?output=csv';

// Procesador de datos CSV robusto
function parseCSV(text) {
    let lines = text.split(/\r?\n/);
    let rows = [];
    for (let i = 1; i < lines.length; i++) { // Salta la cabecera
        let line = lines[i];
        if (!line.trim()) continue;
        
        let arr = [];
        let inQuotes = false;
        let item = '';
        for (let j = 0; j < line.length; j++) {
            let char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                arr.push(item.trim());
                item = '';
            } else {
                item += char;
            }
        }
        arr.push(item.trim());
        rows.push(arr);
    }
    return rows;
}

// Convertidor automático de links de música a reproductores incrustados (Embed)
function getEmbedUrl(url) {
    if (!url) return '';
    let cleanUrl = url.replace(/"/g, '').trim();
    
    // Convertir Spotify
    if (cleanUrl.includes('open.spotify.com')) {
        return cleanUrl.replace('open.spotify.com/', 'open.spotify.com/embed/');
    }
    
    // Convertir YouTube Video
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
    
    // Convertir YouTube Playlist
    if (cleanUrl.includes('youtube.com/playlist')) {
        try {
            const urlParams = new URLSearchParams(cleanUrl.split('?')[1]);
            return `https://www.youtube.com/embed/videoseries?list=${urlParams.get('list')}`;
        } catch(e) { return cleanUrl; }
    }
    
    return cleanUrl;
}

// Crea la estructura visual correspondiente de cada celda
function createItemHTML(item) {
    const tipo = item.tipo.toLowerCase().trim();
    const tituloHtml = item.titulo ? `<h3 class="item-title">${item.titulo}</h3>` : '';
    
    if (tipo === 'texto') {
        return `
            <div class="carousel-item">
                <div class="content-text-block">
                    ${tituloHtml}
                    <p>${item.url}</p>
                </div>
            </div>
        `;
    } else if (tipo === 'imagen') {
        return `
            <div class="carousel-item">
                <div class="content-image-block">
                    ${tituloHtml}
                    <img src="${item.url.replace(/"/g, '')}" alt="${item.titulo}">
                </div>
            </div>
        `;
    } else if (tipo === 'playlist') {
        const embedUrl = getEmbedUrl(item.url);
        return `
            <div class="carousel-item">
                <div class="content-playlist-block" style="width: 100%;">
                    ${tituloHtml}
                    <iframe src="${embedUrl}" width="100%" height="350" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                </div>
            </div>
        `;
    }
    return '';
}

// Lector principal de datos
async function loadCards() {
    const grid = document.getElementById('cards-grid');
    try {
        const response = await fetch(csvUrl);
        const dataText = await response.text();
        const rows = parseCSV(dataText);
        
        // Agrupar filas según la columna "Carta"
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
        
        grid.innerHTML = ''; // Limpiar mensaje de carga
        
        // Generar las cartas en la interfaz
        Object.keys(cardsMap).forEach(cardName => {
            const items = cardsMap[cardName];
            const cardBox = document.createElement('div');
            cardBox.className = 'card-box';
            
            let itemsHTML = items.map(item => createItemHTML(item)).join('');
            let hintHTML = items.length > 1 ? `<div class="carousel-hint">← Desliza la carta para ver más →</div>` : '';
            
            cardBox.innerHTML = `
                <div class="card-cover">
                    <div class="heart">❤️</div>
                    <h2>${cardName}</h2>
                    <span>Toca para abrir</span>
                </div>
                <div class="card-content">
                    <div class="carousel-container">
                        <div class="carousel-track">
                            ${itemsHTML}
                        </div>
                    </div>
                    ${hintHTML}
                </div>
            `;
            
            // Animación de apertura al hacer clic
            cardBox.addEventListener('click', function() {
                if (cardBox.classList.contains('opened')) return;
                cardBox.classList.add('opened');
            });
            
            grid.appendChild(cardBox);
        });
        
    } catch (error) {
        console.error(error);
        grid.innerHTML = `<div class="loading" style="color: #fca5a5;">Error al cargar las sorpresas. Asegúrate de que el Excel esté publicado como CSV.</div>`;
    }
}

window.addEventListener('DOMContentLoaded', loadCards);
