# DN9DKN Website (GitHub Repo · Hosting auf NAS)

Dieses Repo enthält eine **statische** Webseite (kein Build-Schritt).  
Der Source-Code liegt auf GitHub, **ausgeliefert wird die Seite von deinem NAS** unter:

- **https://www.dn9dkn.de/** (www.dn9dkn.de)

Enthalten:

- Callsign/Stations-Info
- QSL-Info
- Awards (Snapshot)
- Optional: „Letzte QSOs“ aus einem JSON-Feed + **2:1 Karte** (Leaflet / OpenStreetMap)
- E-Mail wird per JS zusammengesetzt (Spam-Schutz)

---

## 1) Deployment auf das NAS

### A) Manuell (simpel)
1. Repo auf dem NAS klonen (z. B. per SSH):
   ```bash
   cd /volume1/web/
   git clone https://github.com/DEINNAME/dn9dkn-web.git dn9dkn
   ```
2. Webserver-Root auf `/volume1/web/dn9dkn` zeigen lassen.
3. Updates:
   ```bash
   cd /volume1/web/dn9dkn
   git pull
   ```

### B) Automatisch via GitHub Actions (empfohlen)
Im Repo liegt eine Workflow-Datei: `.github/workflows/deploy-to-nas.yml`

Du musst in GitHub unter **Settings → Secrets and variables → Actions → New repository secret** anlegen:

- `NAS_HOST` → z. B. `example.dyndns.org` oder deine feste IP/Domain
- `NAS_USER` → SSH-User
- `NAS_TARGET_PATH` → Zielpfad, z. B. `/volume1/web/dn9dkn/`
- `NAS_SSH_KEY` → private SSH key (ed25519 empfohlen)

Dann wird bei jedem Push auf `main` automatisch per `rsync` deployt.

> Tipp: Wenn dein NAS **nicht** direkt via SSH aus dem Internet erreichbar sein soll, kannst du stattdessen:
> - per VPN deployen (WireGuard/OpenVPN)
> - oder GitHub Webhook → NAS Script (Pull)

---

## 2) Domain / DNS (www.dn9dkn.de)

Typischer Aufbau:

- `A` (oder `AAAA`) Record für `www` → zeigt auf deine öffentliche IP  
  oder `CNAME www` → auf deinen DDNS-Namen (falls vorhanden).
- Optional zusätzlich:
  - `A` Record für `dn9dkn.de` (Root) → gleiche IP
  - und dann Root → Redirect auf `www` (oder umgekehrt)

Wenn du keine feste IP hast: **DDNS** benutzen und DNS entsprechend auf den DDNS-Namen zeigen lassen.

---

## 3) HTTPS / Let's Encrypt (sehr empfohlen)

- Leite `http://` → `https://` um.
- Zertifikat via Let's Encrypt (viele NAS-Systeme können das direkt; alternativ Reverse Proxy wie nginx).

**Wichtig:** Öffne nicht “wild” alles ins Internet. Lieber Reverse Proxy + Firewall-Regeln + ggf. VPN.

---

## 4) Konfiguration (js/config.js)

Es gibt eine Beispiel-Konfiguration:

- `js/config.example.js` (ist im Repo)
- optional: `js/config.js` (überschreibt Werte, ideal für private Details)

So legst du `js/config.js` an:

```js
window.CONFIG = {
  callsign: "DN9DKN",
  tagline: "Amateur Radio · Germany",

  qth: "Germany",
  grid: "JO41AJ",
  coords: { lat: 51.3958333, lon: 8.0416667 },

  rig: "IC-7300 · ...",

  qslText: "PSE QSL via BUREAU / DIRECT",
  mail: { user: "qsl", domain: "dn9dkn.de" },

  links: {
    qrz: "https://www.qrz.com/db/DN9DKN",
    wavelog: "https://dein-wavelog.tld/",
    clublog: "",
    lotw: "",
    eqsl: ""
  },

  awards: [
    { name: "DX World Award", number: "43708", granted_utc: "2026-01-03 17:27:55", endorsements: ["10M Mixed"] }
  ],

  qsos: {
    url: "https://dein-endpoint.tld/last-qsos.json",
    max: 25
  }
};
```

> `js/config.js` ist in `.gitignore` eingetragen, damit du private Infos nicht aus Versehen pushst.

---

## 5) QSO JSON Format

Die Seite erwartet ein JSON-Array. Minimal:

```json
[
  {
    "time_utc": "2026-01-10T18:02:00Z",
    "call": "DL1ABC",
    "band": "20m",
    "mode": "SSB",
    "country": "Germany",
    "lat": 52.52,
    "lon": 13.405
  }
]
```

- `lat/lon` sind optional (ohne Koordinaten gibt’s keine Marker).
- Für Tests ist `data/last-qsos.sample.json` enthalten.

---

## Lizenz

MIT – siehe `LICENSE`.
