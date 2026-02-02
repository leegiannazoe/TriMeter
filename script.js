document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-btn");
  const startScreen = document.getElementById("start-screen");
  const mainApp = document.getElementById("main-app");
  const horn = document.getElementById("horn");

  startBtn.addEventListener("click", () => {
    horn.play().catch(() => {});

    startScreen.style.display = "none";
    mainApp.classList.remove("hidden");

    // === YOUR MAP CODE (MINIMALLY TOUCHED) ===
    const map = L.map('map').setView([0, 0], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const marker = L.marker([0, 0]).addTo(map);

    const path = [];
    const line = L.polyline(path, { color: 'blue' }).addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const coords = [latitude, longitude];

          marker.setLatLng(coords);
          path.push(coords);
          line.setLatLngs(path);
          map.setView(coords);
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      alert('Geolocation not supported on this device.');
    }

    setTimeout(() => map.invalidateSize(), 300);
  });
});
