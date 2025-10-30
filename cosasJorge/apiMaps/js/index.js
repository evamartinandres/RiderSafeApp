/*
 * mapa.js
 * Contiene la lógica para iniciar el mapa
 */

// Esta es la función que la API de Google llamará
// (por eso el "callback=initMap" en el HTML)
async function initMap() {
    
    // Coordenadas donde queremos centrar el mapa (ej. Madrid)
    const miUbicacion = { lat: 40.416775, lng: -3.703790 };
    
    // Creamos el objeto mapa
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12, // Nivel de zoom
        center: miUbicacion, // Dónde centrarlo
    });

    setupGPXFileLoader(map);
}

function setupGPXFileLoader(map) {
    const input = document.getElementById('gpxFile');
    if (!input) {
        console.error("No se encontró el input #gpxFile");
        return;
    }

    // "Escuchamos" el evento "change", que se dispara
    // cuando el usuario selecciona un archivo.
    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return; // No se seleccionó archivo
        }

        const reader = new FileReader();

        // 1. Cuando el archivo se termine de leer...
        reader.onload = (e) => {
            const gpxText = e.target.result; // El contenido del GPX como texto
            
            // 2. "Traducimos" el texto XML
            const coords = parseGPX(gpxText);
            if (coords.length === 0) {
                console.warn("El archivo GPX no contenía coordenadas <trkpt> válidas.");
                return; // No hacemos nada si no hay puntos
            }
            
            // 3.(Próximo paso: dibujarPolyline(coords);)
            const rutaGPX = new google.maps.Polyline({
              path: coords, // La lista de coordenadas que parseaste
              geodesic: true, // Para que siga la curvatura de la Tierra
              strokeColor: '#FF0000', // Color de la línea (¡Rojo vivo!)
              strokeOpacity: 1.0, // 1.0 = totalmente opaca
              strokeWeight: 3 // Grosor de la línea
            });
            
            rutaGPX.setMap(map);

            // 5. Creamos una "caja de límites" vacía
            const bounds = new google.maps.LatLngBounds();

            coords.forEach(point => {
                bounds.extend(point);
            });
            map.fitBounds(bounds, 50);
        };

        // Le decimos al lector que empiece a leer el archivo como texto
        reader.readAsText(file);
    });
}

/**
 * ¡NUEVO! El "Traductor" de GPX (XML) a una lista de coordenadas
 * * @param {string} gpxText - El contenido del archivo GPX como texto.
 * @returns {Array<google.maps.LatLng>} - Una lista de objetos de coordenadas.
 */

function parseGPX(gpxText) {
    const coords = [];
    
    // Usamos el "traductor" nativo del navegador para XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxText, "text/xml");

    // Los archivos GPX guardan puntos de ruta en etiquetas <trkpt>
    const trackpoints = xmlDoc.getElementsByTagName('trkpt');

    // Recorremos todos los puntos encontrados
    for (let i = 0; i < trackpoints.length; i++) {
        const point = trackpoints[i];
        
        // Obtenemos sus atributos "lat" (latitud) y "lon" (longitud)
        const lat = parseFloat(point.getAttribute('lat'));
        const lon = parseFloat(point.getAttribute('lon'));

        if (!isNaN(lat) && !isNaN(lon)) {
            // Creamos un objeto de Coordenada de Google Maps
            // y lo añadimos a nuestra lista
            coords.push(new google.maps.LatLng(lat, lon));
        }
    }
    
    // ¡Devolvemos la lista lista para dibujar!
    return coords;
}