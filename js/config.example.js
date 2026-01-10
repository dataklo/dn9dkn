/* Rename this file to config.js and adjust values.
   main.js will use window.CONFIG if present. */
window.CONFIG = {
  callsign: "DN9DKN",
  tagline: "Amateur Radio · Germany",

  // Pulled from public lookup sites (you can adjust/override)
  qth: "Germany",
  grid: "JO41AJ",
  coords: { lat: 51.3958333, lon: 8.0416667 },

  rig: "—",

  // QSL info (text as shown on QRZ)
  qslText: "PSE QSL via BUREAU / DIRECT",

  // Email is assembled from user + domain (spam protection)
  mail: { user: "qsl", domain: "dn9dkn.de" },

  links: {
    qrz: "https://www.qrz.com/db/DN9DKN",
    wavelog: "",   // e.g. "https://log.example.com"
    clublog: "",
    lotw: "",
    eqsl: ""
  },

  // Snapshot of your QRZ awards (optional)
  awards: [
    { name: "United States Counties Award", number: "54433", granted_utc: "2026-01-03 17:28:34", endorsements: ["100 Counties Mixed"] },
    { name: "DX World Award", number: "43708", granted_utc: "2026-01-03 17:27:55", endorsements: ["10M Mixed"] },
    { name: "World Radio Friendship Award", number: "92801", granted_utc: "2025-10-25 18:56:18", endorsements: ["10M Mixed", "2M Mixed"] },
    { name: "Grid Squared Award", number: "81989", granted_utc: "2025-10-25 18:55:21", endorsements: ["10M Mixed"] },
    { name: "World Continents Award", number: "78543", granted_utc: "2025-10-25 18:53:58", endorsements: ["10M Mixed"] },
    { name: "30 Years of QRZ", number: "55202", granted_utc: "2025-09-24 19:22:03", endorsements: ["10M Mixed", "2M Mixed"] }
  ],

  // QSO list/map: you can point to a JSON endpoint, or use the sample file
  qsos: {
    url: "./data/last-qsos.sample.json",
    max: 25
  },

  // Map defaults (fallback)
  map: {
    zoom: 6
  }
};
