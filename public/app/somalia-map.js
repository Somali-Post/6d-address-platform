// --- Global Variables & Element References ---
let map;
let geocoder;
let mapClickHandler = null;
let gridLines = [];
let drawnObjects = [];

const somaliaAdminData = {
    "Awdal": ["Baki", "Borama", "Lughaya", "Zeila"],
    "Bakool": ["El Barde", "Hudur", "Rabdhure", "Tiyeglow", "Wajid"],
    "Banaadir": ["Abdiaziz", "Bondhere", "Daynile", "Hamar-Jajab", "Hamar-Weyne", "Hawle Wadag", "Hodan", "Kaaraan", "Shibis", "Waberi", "Wadajir", "Wardhigley", "Yaqshid"],
    "Bari": ["Alula", "Bandarbeyla", "Bosaso", "Iskushuban", "Qandala", "Ufeyn"],
    "Bay": ["Baidoa", "Burhakaba", "Dinsor", "Qasahdhere"],
    "Galguduud": ["Abudwak", "Adado", "Dhusa Mareb", "El Buur", "El Dher"],
    "Gedo": ["Baardheere", "Beled Hawo", "Doolow", "El Wak", "Garbahaarey", "Luuq"],
    "Hiiraan": ["Beledweyne", "Buloburde", "Jalalaqsi", "Mataban"],
    "Lower Juba": ["Afmadow", "Badhadhe", "Jamame", "Kismayo"],
    "Lower Shabelle": ["Afgooye", "Barawa", "Kurtunwarey", "Merca", "Qoryoley", "Wanlaweyn"],
    "Middle Juba": ["Bu'ale", "Jilib", "Sakow"],
    "Middle Shabelle": ["Adan Yabal", "Balad", "Jowhar", "Mahaday"],
    "Mudug": ["Galkayo", "Galdogob", "Harardhere", "Hobyo", "Jariban"],
    "Nugal": ["Burtinle", "Eyl", "Garowe"],
    "Sanaag": ["Badhan", "El Afweyn", "Erigavo", "Dhahar"],
    "Sool": ["Aynabo", "Las Anod", "Taleh", "Hudun"],
    "Togdheer": ["Buhoodle", "Burao", "Oodweyne", "Sheikh"],
    "Woqooyi Galbeed": ["Berbera", "Gabiley", "Hargeisa"]
};

// --- UTILITY FUNCTIONS (Defined First) ---
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// --- CORE LOGIC FUNCTIONS (Defined Before initMap) ---

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
        const regionName = regionSelect.value;
        panToLocation(`${regionName}, Somalia`, 11);
        populateDistricts(regionName);
        districtGroup.classList.remove('disabled');
        districtSelect.disabled = false;
        finalDetails.classList.add('hidden');
        disableMapClicks();
        clearMapObjects();
    });

    districtSelect.addEventListener('change', () => {
        const regionName = regionSelect.value;
        const districtName = districtSelect.value;
        panToLocation(`${districtName}, ${regionName}, Somalia`, 15, true);
        enableMapClicks();
        clearMapObjects();
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

function resetWorkflow() {
    const registrationForm = document.getElementById('registration-form');
    const districtGroup = document.getElementById('district-group');
    const districtSelect = document.getElementById('reg-district');
    const finalDetails = document.getElementById('final-details');
    
    registrationForm.reset();
    districtGroup.classList.add('disabled');
    districtSelect.disabled = true;
    finalDetails.classList.add('hidden');
    disableMapClicks();
    clearMapObjects();
    map.setRestriction(null);
    map.panTo({ lat: 5.152149, lng: 46.199615 });
    map.setZoom(6);
}

function panToLocation(locationString, zoom, shouldRestrict = false) {
    geocoder.geocode({ 'address': locationString }, (results, status) => {
        if (status === 'OK') {
            map.fitBounds(results[0].geometry.viewport);
            if (zoom) {
                google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
                    this.setZoom(zoom);
                });
            }
            if (shouldRestrict) {
                map.setRestriction({ latLngBounds: results[0].geometry.viewport, strictBounds: false });
            } else {
                map.setRestriction(null);
            }
        } else {
            console.error('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function enableMapClicks() {
    if (mapClickHandler) return;
    mapClickHandler = map.addListener('click', (event) => {
        handleMapClick(event.latLng);
    });
}

function disableMapClicks() {
    if (mapClickHandler) {
        google.maps.event.removeListener(mapClickHandler);
        mapClickHandler = null;
    }
}

async function handleMapClick(rawLatLng) {
    const finalDetails = document.getElementById('final-details');
    const regCodeField = document.getElementById('reg-code');
    
    clearMapObjects();
    drawGridBoxes(rawLatLng);
    finalDetails.classList.remove('hidden');
    const snappedLatLng = snapToGridCenter(rawLatLng);
    const code = generate6DCode(snappedLatLng.lat(), snappedLatLng.lng());
    regCodeField.textContent = code.code6D;
}

function updateDynamicGrid() {
    clearGridLines();
    const zoom = map.getZoom();
    const bounds = map.getBounds();
    if (!bounds) return;
    const spacing = getGridSpacingForZoom(zoom);
    if (spacing === null) return;
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const gridStyle = { strokeColor: '#333333', strokeOpacity: 0.3, strokeWeight: 1, clickable: false, zIndex: 2 };
    for (let lat = Math.floor(sw.lat() / spacing) * spacing; lat < ne.lat(); lat += spacing) {
        gridLines.push(new google.maps.Polyline({ ...gridStyle, path: [{ lat: lat, lng: sw.lng() }, { lat: lat, lng: ne.lng() }], map: map }));
    }
    for (let lng = Math.floor(sw.lng() / spacing) * spacing; lng < ne.lng(); lng += spacing) {
        gridLines.push(new google.maps.Polyline({ ...gridStyle, path: [{ lat: sw.lat(), lng: lng }, { lat: ne.lat(), lng: lng }], map: map }));
    }
}

function getGridSpacingForZoom(zoom) {
    if (zoom >= 17) return 0.0001;
    else if (zoom >= 13) return 0.01;
    else return null;
}

function clearGridLines() {
    gridLines.forEach(line => line.setMap(null));
    gridLines = [];
}

function populateRegions() {
    const regionSelect = document.getElementById('reg-region');
    const regions = Object.keys(somaliaAdminData).sort();
    regionSelect.innerHTML = '<option value="" disabled selected>-- Select a Region --</option>';
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
    });
}

function populateDistricts(region) {
    const districtSelect = document.getElementById('reg-district');
    const districts = somaliaAdminData[region].sort();
    districtSelect.innerHTML = '<option value="" disabled selected>-- Select a District --</option>';
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });
}

function generate6DCode(lat, lon) {
    const absLat = Math.abs(lat);
    const absLon = Math.abs(lon);
    const lat_d2 = Math.floor(absLat * 100) % 10;
    const lat_d3 = Math.floor(absLat * 1000) % 10;
    const lat_d4 = Math.floor(absLat * 10000) % 10;
    const lon_d2 = Math.floor(absLon * 100) % 10;
    const lon_d3 = Math.floor(absLon * 1000) % 10;
    const lon_d4 = Math.floor(absLon * 10000) % 10;
    const code6D = `${lat_d2}${lon_d2}-${lat_d3}${lon_d3}-${lat_d4}${lon_d4}`;
    return { code6D };
}

function drawGridBoxes(latLng) {
    const lat = latLng.lat();
    const lon = latLng.lng();
    const boxStyles = {
        '2d': { color: '#D32F2F', zIndex: 4, scale: 100, fillOpacity: 0.0 },
        '4d': { color: '#388E3C', zIndex: 5, scale: 1000, fillOpacity: 0.0 },
        '6d': { color: '#1976D2', zIndex: 6, scale: 10000, fillOpacity: 0.15 }
    };
    for (const key in boxStyles) {
        const style = boxStyles[key];
        const scale = style.scale;
        const cellSize = 1 / scale;
        const swLat = Math.floor(lat * scale) / scale;
        const swLng = Math.floor(lon * scale) / scale;
        const bounds = { south: swLat, west: swLng, north: swLat + cellSize, east: swLng + cellSize };
        drawnObjects.push(new google.maps.Rectangle({
            strokeColor: style.color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: style.color,
            fillOpacity: style.fillOpacity,
            map: map,
            bounds: bounds,
            zIndex: style.zIndex,
            clickable: false
        }));
    }
}

function clearMapObjects() {
    drawnObjects.forEach(obj => obj.setMap(null));
    drawnObjects = [];
}

function snapToGridCenter(latLng) {
    const scale = 10000;
    const halfCell = 0.00005;
    const snappedLat = (Math.floor(latLng.lat() * scale) / scale) + halfCell;
    const snappedLng = (Math.floor(latLng.lng() * scale) / scale) + halfCell;
    return new google.maps.LatLng(snappedLat, snappedLng);
}

// --- ENTRY POINT FUNCTIONS (Defined Last) ---

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

    initializeWorkflow();

    const debouncedUpdateGrid = debounce(updateDynamicGrid, 250);
    map.addListener('idle', debouncedUpdateGrid);
}

function loadGoogleMapsScript() {
    const script = document.getElementById('google-maps-script');
    if (typeof GOOGLE_MAPS_API_KEY !== 'undefined') {
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&v=weekly&libraries=geometry`;
    } else {
        console.error("Google Maps API Key is not defined. Check Netlify snippet injection.");
    }
}

loadGoogleMapsScript();
window.initMap = initMap;