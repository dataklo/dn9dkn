/* Rename this file to config.js and adjust values.
   main.js will use window.CONFIG if present. */
window.CONFIG = {
  // On-Air Widget URL (iframe src)
  // Example: "https://example.com/onair-widget"
  onAirWidgetUrl: "",

  // Optional: Link to your log / Wavelog (shown as "Log öffnen")
  logUrl: "https://example.com/log",

  // Optional: QSO JSON endpoint that returns an array of QSOs.
  // See README for expected format.
  qsoJsonUrl: "",

  // Station info
  station: {
    locator: "JOxxXX",
    qth: "Germany",
    rig: "Rig / Antenna"
  },

  // Location tile (simple text + link)
  locationTile: {
    text: "Mein QTH (Text)",
    url: "https://www.openstreetmap.org/"
  },

  // QSL mail (assembled in JS)
  qslMail: {
    user: "qsl",
    domain: "dn9dkn.de"
  },

  // Map defaults
  map: {
    center: [51.1657, 10.4515], // Germany
    zoom: 5
  }
};
