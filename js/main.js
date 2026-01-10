(function () {
  // Try loading optional config.js AFTER config.example.js
  // If user created js/config.js, it should overwrite CONFIG.
  const tryLoadConfigJs = () =>
    new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = "./js/config.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });

  const safeText = (s) => (s == null ? "" : String(s));
  const fmtUTC = (isoOrDate) => {
    try {
      const d = new Date(isoOrDate);
      // Format: YYYY-MM-DD HH:MM
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
    } catch {
      return safeText(isoOrDate);
    }
  };

  const sampleQsos = [
    { time_utc: "2026-01-10T10:12:00Z", call: "DL1ABC", band: "20m", mode: "SSB", rst: "59/59", country: "Germany", lat: 52.52, lon: 13.405 },
    { time_utc: "2026-01-10T09:48:00Z", call: "OK2XYZ", band: "40m", mode: "CW",  rst: "579/579", country: "Czechia", lat: 49.195, lon: 16.607 },
    { time_utc: "2026-01-10T09:03:00Z", call: "PA3DEF", band: "10m", mode: "FT8", rst: "-10/-12", country: "Netherlands", lat: 52.367, lon: 4.904 }
  ];

  const byId = (id) => document.getElementById(id);

  const setMail = (cfg) => {
    const mail = `${cfg.qslMail?.user || "qsl"}@${cfg.qslMail?.domain || "example.com"}`;
    const link = byId("mailLink");
    const text = byId("qslMailText");
    if (link) {
      link.textContent = mail;
      link.href = `mailto:${mail}`;
    }
    if (text) text.textContent = mail;
  };

  const setStation = (cfg) => {
    byId("locatorText").textContent = safeText(cfg.station?.locator || "—");
    byId("qthText").textContent = safeText(cfg.station?.qth || "—");
    byId("rigText").textContent = safeText(cfg.station?.rig || "—");
  };

  const setLocationTile = (cfg) => {
    const t = byId("locationText");
    const a = byId("locationLink");

    const txt = safeText(cfg.locationTile?.text || "—");
    const url = safeText(cfg.locationTile?.url || "https://www.openstreetmap.org/");

    if (t) t.textContent = txt;
    if (a) a.href = url;
  };

  const setOnAirIframe = (cfg) => {
    const iframe = byId("onAirIframe");
    if (!iframe) return;

    const url = safeText(cfg.onAirWidgetUrl || "");
    iframe.src = url;

    const badge = byId("statusBadge");
    if (badge) {
      const strong = badge.querySelector("strong");
      // Minimal: if url set => "Active", else "Not configured"
      strong.textContent = url ? "Configured" : "Not configured";
    }
  };

  const setLogLink = (cfg) => {
    const a = byId("qsoOpenLogLink");
    if (!a) return;
    const url = safeText(cfg.logUrl || "#");
    a.href = url;
  };

  const renderQsoTable = (qsos) => {
    const tb = byId("qsoTbody");
    if (!tb) return;

    tb.innerHTML = "";
    if (!qsos.length) {
      tb.innerHTML = `<tr><td colspan="6" class="muted">Keine Daten.</td></tr>`;
      return;
    }

    for (const q of qsos) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${fmtUTC(q.time_utc || q.time || q.date)}</td>
        <td><strong>${safeText(q.call || "—")}</strong></td>
        <td>${safeText(q.band || "—")}</td>
        <td>${safeText(q.mode || "—")}</td>
        <td>${safeText(q.rst || q.rst_sent && q.rst_recv ? `${q.rst_sent}/${q.rst_recv}` : "—")}</td>
        <td>${safeText(q.country || "—")}</td>
      `;
      tb.appendChild(tr);
    }

    const meta = byId("qsoMeta");
    if (meta) meta.textContent = `Einträge: ${qsos.length}`;
  };

  const loadQsos = async (cfg) => {
    const url = safeText(cfg.qsoJsonUrl || "");
    if (!url) return sampleQsos;

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("JSON is not an array");
      return data;
    } catch (e) {
      console.warn("QSO load failed, using sample data:", e);
      return sampleQsos;
    }
  };

  const initMap = (cfg, qsos) => {
    const mapEl = byId("leafletMap");
    if (!mapEl || typeof L === "undefined") return;

    const center = cfg.map?.center || [51.1657, 10.4515];
    const zoom = cfg.map?.zoom ?? 5;

    const map = L.map(mapEl, { scrollWheelZoom: false }).setView(center, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const points = qsos
      .filter((q) => Number.isFinite(q.lat) && Number.isFinite(q.lon))
      .map((q) => ({ ...q, lat: Number(q.lat), lon: Number(q.lon) }));

    if (!points.length) return;

    const markers = [];
    for (const p of points) {
      const m = L.marker([p.lat, p.lon]).addTo(map);
      m.bindPopup(
        `<strong>${safeText(p.call || "")}</strong><br/>${safeText(p.band || "")} · ${safeText(p.mode || "")}<br/>${fmtUTC(p.time_utc || p.time || p.date)}`
      );
      markers.push(m);
    }

    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lon]));
    map.fitBounds(bounds.pad(0.25));
  };

  const setYear = () => {
    const y = byId("year");
    if (y) y.textContent = String(new Date().getFullYear());
  };

  (async function boot() {
    await tryLoadConfigJs(); // optional
    const cfg = window.CONFIG || {};

    setYear();
    setMail(cfg);
    setStation(cfg);
    setLocationTile(cfg);
    setOnAirIframe(cfg);
    setLogLink(cfg);

    const qsos = await loadQsos(cfg);
    renderQsoTable(qsos);
    initMap(cfg, qsos);
  })();
})();
