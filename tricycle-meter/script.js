const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const mainApp = document.getElementById("main-app");

let map, marker, line;
let path = [];
let totalDistance = 0;
let lastCoords = null;
let watchId = null;

// Distance formula (pang Grab / Angkas style)
function haversineDistance(a, b) {
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;

  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);

  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
}

// START Website
startBtn.addEventListener("click", () => {
  document.getElementById("horn").play();

  startScreen.style.display = "none";
  mainApp.classList.remove("hidden");

  // IMPORTANT: wait for layout to finish BEFORE creating map
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
  }, 1000); // THIS is the magic
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

  // Fare rules
  let fare = 30;
  if (km > 1) {
    fare += Math.ceil(km - 1) * 50;
  }

  if (document.getElementById("sundo").checked) {
    fare += 10;
  }

  if (document.getElementById("category").value === "discount") {
    fare *= 0.8;
  }

  const passengers = Number(document.getElementById("passengers").value);
  const fareType = document.getElementById("fareType").value;

  let payable = fare;
  if (fareType === "regular") {
    payable = fare / passengers;
  }

  document.getElementById("receipt-text").innerText =
    `Distance: ${km.toFixed(2)} km
Total Fare: ₱${fare.toFixed(2)}
Payable: ₱${payable.toFixed(2)}`;

  document.getElementById("startRideBtn").disabled = false;
  document.getElementById("endRideBtn").disabled = true;
});
window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 500);
});


