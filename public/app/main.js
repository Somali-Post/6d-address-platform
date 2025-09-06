// --- Global Variables ---
let map;
let geocoder;
let placesService;
let drawnObjects = [];
let gridLines = [];

// --- 1. Dynamic API Loader ---
function loadGoogleMapsAPI(apiKey) {
    return new Promise((resolve, reject) => {
        // Check if the script has already been added to prevent duplicates
        if (window.google && window.google.maps) {
            return resolve();
        }
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&v=weekly&libraries=places`;
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
        // The `initMap` function will be called automatically by the Google Maps script's callback
    } catch (error) {
        console.error(error);
        document.body.innerHTML = '<h1>Error: Could not load Google Maps.</h1>';
    }
}

// --- 3. initMap (Called by Google's Callback) ---
// This function must be globally accessible
window.initMap = function() {
    const defaultLocation = { lat: 13.7563, lng: 100.5018 };
    geocoder = new google.maps.Geocoder();

    map = new google.maps.Map(document.getElementById("map"), {
        center: defaultLocation,
        zoom: 12,
        styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
        disableDefaultUI: true,
        zoomControl: true,
        draggableCursor: 'pointer',
        gestureHandling: 'greedy'
    });
    
    placesService = new google.maps.places.PlacesService(map);

    map.addListener('click', (event) => { handleMapClick(event.latLng); });
    const debouncedUpdateGrid = debounce(updateDynamicGrid, 250);
    map.addListener('idle', debouncedUpdateGrid);
    const geolocateBtn = document.getElementById('geolocate-btn');
    geolocateBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    map.setCenter(userLatLng);
                    map.setZoom(18);
                    handleMapClick(userLatLng);
                },
                () => { alert("Error: The Geolocation service failed."); }
            );
        } else {
            alert("Error: Your browser doesn't support geolocation.");
        }
    });
    
    updateDynamicGrid();
}

// --- (All other helper functions like handleMapClick, parseAddressComponents, debounce, etc., remain exactly the same) ---
// ...

// --- 4. Use window.onload to start the process ---
window.onload = startApp;