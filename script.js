const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const mainApp = document.getElementById("main-app");

let map, marker, line;
let path = [];
let totalDistance = 0;
let lastCoords = null;
let watchId = null;

// Distance formula aka haversineayawkona
function haversineDistance(a, b) {
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  // toRad is for degree to radians conversion

  const dLat = toRad(b[0] - a[0]); // difference in latitude in point 1 to b
  const dLng = toRad(b[1] - a[1]); // difference in longitude in point 1 to b

  const lat1 = toRad(a[0]); // lat of point a in radians
  const lat2 = toRad(b[0]);

  // haversine formula a=sin²(Δlat/2)+cos(lat1)⋅cos(lat2)⋅sin²(Δlng/2)
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) ** 2;

  // atan is for arc tangent // hinay hinay bossing diko kaya boi
  return R * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
}

// START Website
startBtn.addEventListener("click", () => {
  document.getElementById("horn").play();

  startScreen.style.display = "none";
  mainApp.classList.remove("hidden");

  // MAP NNAMAN // basic map
  setTimeout(() => {
    map = L.map("map", {
      zoomControl: true,
      attributionControl: true
    }).setView([0, 0], 17);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    marker = L.marker([0, 0]).addTo(map);
    line = L.polyline([], { color: "blue" }).addTo(map);

    map.invalidateSize();
  }, 1000); // ETO ANG LILIGTAS SA MAP
});

// START RIDE
document.getElementById("startRideBtn").addEventListener("click", () => {
  if (!map) return;

  totalDistance = 0;
  path = [];
  lastCoords = null;
  line.setLatLngs([]);

  watchId = navigator.geolocation.watchPosition(
    pos => {
      const coords = [pos.coords.latitude, pos.coords.longitude];

      marker.setLatLng(coords);
      map.setView(coords, map.getZoom());

      if (lastCoords) {
        totalDistance += haversineDistance(lastCoords, coords);
      }

      lastCoords = coords;
      path.push(coords);
      line.setLatLngs(path);
    },
    err => console.error(err),
    { enableHighAccuracy: true, maximumAge: 0 }
  );

  document.getElementById("startRideBtn").disabled = true;
  document.getElementById("endRideBtn").disabled = false;
});

// END RIDE
document.getElementById("endRideBtn").addEventListener("click", () => {
  navigator.geolocation.clearWatch(watchId);

  const km = totalDistance / 1000;
  const roundedKm = Math.max(1, Math.ceil(km)); // minimum 1 km

  const fareType = document.getElementById("fareType").value; // "regular" or "special"
  const passengers = Number(document.getElementById("passengers").value);
  const isDiscount = document.getElementById("category").value === "discount";
  const isSundo = document.getElementById("sundo").checked;

  let fare = 0;

  // SPECIAL trip (whole tricycle, NOT per passenger)
  if (fareType === "special") {
    if (isDiscount) {
      // Discounted special trip
      fare = 24 + Math.max(0, roundedKm - 1) * 4;
    } else {
      // Regular special trip
      fare = 30 + Math.max(0, roundedKm - 1) * 5;
    }
    // covers up to 2 passengers (no per-head computation)
  }

  // REGULAR trip (PER PASSENGER)
  else {
    if (isDiscount) {
      // Discounted regular trip
      fare =
        passengers *
        (8 + Math.max(0, roundedKm - 1) * 1.6);
    } else {
      // Regular passengers
      fare =
        passengers *
        (10 + Math.max(0, roundedKm - 1) * 2);
    }
  }

  // sundo add on (NOT special fare)
  if (isSundo && fareType === "regular") {
    fare += 10;
  }

  // RECEIPT DISPLAY
  let receiptText =
`Distance: ${km.toFixed(2)} km
Rounded Distance: ${roundedKm} km
Total Fare: ₱${fare.toFixed(2)}`;

  // show per-head payable ONLY for regular fare
  if (fareType === "regular") {
    receiptText +=
`\nPayable per passenger: ₱${(fare / passengers).toFixed(2)}`;
  }

  document.getElementById("receipt-text").innerText = receiptText;

  document.getElementById("startRideBtn").disabled = false;
  document.getElementById("endRideBtn").disabled = true;
});

// MOBILE ORIENTATION FIX
window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 500);
});
