// Global variables
let map;
let geocoder;
let placesService;
let drawnObjects = [];
let gridLines = [];

// --- DYNAMICALLY LOAD GOOGLE MAPS SCRIPT ---
function loadGoogleMapsScript() {
    const script = document.getElementById('google-maps-script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&v=weekly&libraries=places`;
}

// (The rest of the file is identical to the last working version)
function debounce(func, delay) { /* ... */ }

function initMap() {
    const defaultLocation = { lat: 13.7563, lng: 100.5018 };
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById("map"), { /* ... */ });
    placesService = new google.maps.places.PlacesService(map);
    // (rest of initMap)
}
// (all other functions: handleMapClick, getReverseGeocode, etc.)

// --- SCRIPT ENTRY POINT ---
// Load the script, which will then call initMap
loadGoogleMapsScript();
window.initMap = initMap;