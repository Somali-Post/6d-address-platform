// --- Global Variables & Data ---
let map;
let geocoder;
// (all other variables)
// ...

// --- 1. Dynamic API Loader ---
function loadGoogleMapsAPI(apiKey) {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            return resolve();
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&v=weekly&libraries=geometry`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Google Maps script failed to load.'));
        document.head.appendChild(script);
    });
}

// --- 2. Main Application Entry Point ---
async function startApp() {
    if (typeof GOOGLE_MAPS_API_KEY === 'undefined' || !GOOGLE_MAPS_API_KEY) {
        console.error("Google Maps API Key is not defined. Check Netlify snippet injection.");
        document.body.innerHTML = '<h1>Error: Map configuration is missing.</h1>';
        return;
    }
    try {
        await loadGoogleMapsAPI(GOOGLE_MAPS_API_KEY);
    } catch (error) {
        console.error(error);
        document.body.innerHTML = '<h1>Error: Could not load Google Maps.</h1>';
    }
}

// --- 3. initMap (Called by Google's Callback) ---
window.initMap = function() {
    const somaliaCenter = { lat: 5.152149, lng: 46.199615 };
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById("map"), {
        center: somaliaCenter,
        zoom: 6,
        disableDefaultUI: true,
        zoomControl: true,
        minZoom: 6,
    });
    initializeWorkflow();
    const debouncedUpdateGrid = debounce(updateDynamicGrid, 250);
    map.addListener('idle', debouncedUpdateGrid);
}

// --- (All other helper functions like initializeWorkflow, panToLocation, debounce, etc., remain exactly the same) ---
// ...

// --- 4. Use window.onload to start the process ---
window.onload = startApp;