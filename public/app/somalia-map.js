// --- Global Variables & Element References ---
let map;
let geocoder;
let mapClickHandler = null;
let gridLines = [];
let drawnObjects = [];

// --- DYNAMICALLY LOAD GOOGLE MAPS SCRIPT ---
function loadGoogleMapsScript() {
    const script = document.getElementById('google-maps-script');
    if (typeof GOOGLE_MAPS_API_KEY !== 'undefined') {
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&v=weekly&libraries=geometry`;
    } else {
        console.error("Google Maps API Key is not defined. Check Netlify snippet injection.");
    }
}

// --- The ONE AND ONLY entry point, called by Google Maps ---
function initMap() {
    const somaliaCenter = { lat: 5.152149, lng: 46.199615 };
    geocoder = new google.maps.Geocoder();

    map = new google.maps.Map(document.getElementById("map"), {
        center: somaliaCenter,
        zoom: 6,
        disableDefaultUI: true,
        zoomControl: true,
        minZoom: 6,
    });

    // --- SETUP ALL LOGIC AND LISTENERS INSIDE INITMAP ---
    initializeWorkflow();
    loadAndDrawMasks(); // This can be removed if not needed for the new flow

    const debouncedUpdateGrid = debounce(updateDynamicGrid, 250);
    map.addListener('idle', debouncedUpdateGrid);
}

// --- Workflow Logic ---
function initializeWorkflow() {
    const regionSelect = document.getElementById('reg-region');
    const districtSelect = document.getElementById('reg-district');
    const districtGroup = document.getElementById('district-group');
    const finalDetails = document.getElementById('final-details');
    const registrationForm = document.getElementById('registration-form');
    const modal = document.getElementById('confirmation-modal');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    populateRegions();
    
    regionSelect.addEventListener('change', () => {
        // ... (rest of the function)
    });

    districtSelect.addEventListener('change', () => {
        // ... (rest of the function)
    });

    registrationForm.addEventListener('submit', (event) => {
        event.preventDefault();
        modal.classList.remove('hidden');
    });

    modalConfirmBtn.addEventListener('click', () => {
        alert("You have successfully registered this address!");
        modal.classList.add('hidden');
        resetWorkflow();
    });

    modalCancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
}

// (All other functions like resetWorkflow, panToLocation, populateRegions, etc., remain unchanged)
// ...

// --- SCRIPT ENTRY POINT ---
loadGoogleMapsScript();
window.initMap = initMap;