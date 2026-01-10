# DN9DKN Web (GitHub Pages)

Statische Website für GitHub Pages: On-Air Widget, letzte QSOs (z. B. aus Wavelog) und eine 2:1 Karte.

## Quick Start

1. Repo erstellen (z. B. `dn9dkn-web`) und diese Dateien reinlegen.
2. Optional: `js/config.example.js` nach `js/config.js` kopieren und Werte setzen.
3. GitHub Pages aktivieren:
   - Repo → **Settings** → **Pages**
   - **Deploy from a branch**
   - Branch: `main` / Folder: `/ (root)`

Danach ist die Seite unter:
- `https://DEINNAME.github.io/dn9dkn-web/` erreichbar  
Oder als User-Site:
- Repo-Name `DEINNAME.github.io` → `https://DEINNAME.github.io/`

## Konfiguration (js/config.js)

Lege `js/config.js` an (wird automatisch geladen) und überschreibe `window.CONFIG`.

Beispiel:

```js
window.CONFIG = {
  onAirWidgetUrl: "https://DEIN-WIDGET-URL",
  logUrl: "https://DEIN-WAVELOG-ODER-LOG-LINK",
  qsoJsonUrl: "https://DEIN-ENDPOINT/last-qsos.json",
  station: { locator: "JOxxXX", qth: "Germany", rig: "..." },
  locationTile: { text: "Mein QTH (Text)", url: "https://www.openstreetmap.org/..." },
  qslMail: { user: "qsl", domain: "dn9dkn.de" },
  map: { center: [51.1657, 10.4515], zoom: 5 }
};
