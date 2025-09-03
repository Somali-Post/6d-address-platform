// --- Global Variables & Element References ---
let map;
let geocoder;
// (all other variables)

// --- DYNAMICALLY LOAD GOOGLE MAPS SCRIPT ---
function loadGoogleMapsScript() {
    const script = document.getElementById('google-maps-script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&v=weekly&libraries=geometry`;
}

// (The rest of the file is identical to the last working version)
function initMap() {
    // (all of initMap)
}
// (all other functions: initializeWorkflow, panToLocation, etc.)

// --- SCRIPT ENTRY POINT ---
loadGoogleMapsScript();
window.initMap = initMap;