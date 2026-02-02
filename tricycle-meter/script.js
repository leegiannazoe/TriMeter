const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const mainApp = document.getElementById("main-app");

document.getElementById("start-btn").addEventListener("click", () => {
  document.getElementById("horn").play();

  startScreen.style.display = "none";
  mainApp.classList.remove("hidden");

  // Initialize Leaflet map
  const map = L.map("map").setView([0, 0], 17);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const marker = L.marker([0, 0]).addTo(map);
  const path = [];
  const line = L.polyline(path, { color: 'blue' }).addTo(map);

  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = [latitude, longitude];

        // Marker
        marker.setLatLng(coords);

        // Path line
        path.push(coords);
        line.setLatLngs(path);

        // Center map
        map.setView(coords, map.getZoom());
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  } else {
    alert("Geolocation not supported on this device.");
  }

  // Fix map display after layout changes
  setTimeout(() => { map.invalidateSize(); }, 300);
});

// Example fare calculator
function calculateFare() {
  const fareType = document.getElementById("fareType").value;
  const passengers = Number(document.getElementById("passengers").value);
  const category = document.getElementById("category").value;

  let baseFare = fareType === "regular" ? 30 : 50;
  if (category === "discount") baseFare *= 0.8;
  const total = baseFare * passengers;

  document.getElementById("receipt-text").innerText =
    `₱${total.toFixed(2)}`;
}

