// Global variables
let map;
let geocoder;
let placesService;
let drawnObjects = [];
let gridLines = [];

// --- DYNAMICALLY LOAD GOOGLE MAPS SCRIPT ---
// This function is now called when the page loads.
function loadGoogleMapsScript() {
    const script = document.getElementById('google-maps-script');
    // Ensure the global API key variable from Netlify exists before using it.
    if (typeof GOOGLE_MAPS_API_KEY !== 'undefined') {
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&v=weekly&libraries=places`;
    } else {
        console.error("Google Maps API Key is not defined. Check Netlify snippet injection.");
    }
}

// --- The ONE AND ONLY entry point, called by Google Maps ---
function initMap() {
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

    // --- SETUP ALL EVENT LISTENERS INSIDE INITMAP ---
    map.addListener('click', (event) => { handleMapClick(event.latLng); });
    const debouncedUpdateGrid = debounce(updateDynamicGrid, 250);
    map.addListener('idle', debouncedUpdateGrid);
    const geolocateBtn = document.getElementById('geolocate-btn');
    geolocateBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLatLng = new google.maps.LatLng(
                        position.coords.latitude,
                        position.coords.longitude
                    );
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
    
    // Initial draw of the grid
    updateDynamicGrid();
}

// (All other functions like handleMapClick, parseAddressComponents, etc., remain unchanged)
// ...

// --- SCRIPT ENTRY POINT ---
// Call the loading function when the script is first executed.
loadGoogleMapsScript();
window.initMap = initMap;