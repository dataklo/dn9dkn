(function () {
  const byId = (id) => document.getElementById(id);
  const safeText = (v) => (v == null ? "" : String(v));

  const waitForOptionalConfig = async () => {
    // Wait a tick so config.js (if present) has a chance to load.
    await new Promise((r) => setTimeout(r, 0));
    return window.CONFIG || {};
  };

  const pad2 = (n) => String(n).padStart(2, "0");
  const fmtUTC = (isoOrDate) => {
    try {
      const d = new Date(isoOrDate);
      if (Number.isNaN(d.getTime())) return safeText(isoOrDate);
      return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
    } catch {
      return safeText(isoOrDate);
    }
  };

  const setText = (id, text) => {
    const el = byId(id);
    if (el) el.textContent = text;
  };

  const setHrefOrHide = (id, href) => {
    const el = byId(id);
    if (!el) return;
    if (!href) {
      el.style.display = "none";
      return;
    }
    el.href = href;
  };

  const buildMail = (cfg) => {
    const user = cfg.mail?.user || "qsl";
    const domain = cfg.mail?.domain || "example.com";
    return `${user}@${domain}`;
  };

  const renderAwards = (awards) => {
    const tb = byId("awardsTbody");
    if (!tb) return;

    tb.innerHTML = "";
    if (!Array.isArray(awards) || awards.length === 0) {
      tb.innerHTML = `<tr><td colspan="4" class="muted">Keine Awards konfiguriert.</td></tr>`;
      return;
    }

    for (const a of awards) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${safeText(a.name)}</strong></td>
        <td>${safeText(a.number || "")}</td>
        <td>${safeText(a.granted_utc || "")}</td>
        <td>${Array.isArray(a.endorsements) ? a.endorsements.map(safeText).join(", ") : ""}</td>
      `;
      tb.appendChild(tr);
    }
  };

  const loadQsos = async (cfg) => {
    const url = cfg.qsos?.url;
    if (!url) return [];
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("QSO JSON is not an array");
      const max = Number(cfg.qsos?.max || 25);
      return data.slice(0, Math.max(1, max));
    } catch (e) {
      console.warn("QSO load failed:", e);
      return [];
    }
  };

  const renderQsoTable = (qsos) => {
    const tb = byId("qsoTbody");
    const meta = byId("qsoMeta");
    if (!tb) return;

    tb.innerHTML = "";
    if (!Array.isArray(qsos) || qsos.length === 0) {
      tb.innerHTML = `<tr><td colspan="5" class="muted">Keine Daten. (Setze qsos.url in config.js)</td></tr>`;
      if (meta) meta.textContent = "Einträge: 0";
      return;
    }

    for (const q of qsos) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${fmtUTC(q.time_utc || q.time || q.date)}</td>
        <td><strong>${safeText(q.call || "—")}</strong></td>
        <td>${safeText(q.band || "—")}</td>
        <td>${safeText(q.mode || "—")}</td>
        <td>${safeText(q.country || "—")}</td>
      `;
      tb.appendChild(tr);
    }
    if (meta) meta.textContent = `Einträge: ${qsos.length}`;
  };

  const initMap = (cfg, qsos) => {
    const mapEl = byId("map");
    if (!mapEl || typeof L === "undefined") return;

    const lat = Number(cfg.coords?.lat);
    const lon = Number(cfg.coords?.lon);
    const hasHome = Number.isFinite(lat) && Number.isFinite(lon);

    const zoom = Number(cfg.map?.zoom ?? 6);
    const map = L.map(mapEl, { scrollWheelZoom: false }).setView(
      hasHome ? [lat, lon] : [51.1657, 10.4515],
      hasHome ? zoom : 5
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    const points = (Array.isArray(qsos) ? qsos : [])
      .filter((q) => Number.isFinite(Number(q.lat)) && Number.isFinite(Number(q.lon)))
      .map((q) => ({ ...q, lat: Number(q.lat), lon: Number(q.lon) }));

    const homeMarker = hasHome
      ? L.circleMarker([lat, lon], { radius: 7 }).addTo(map).bindPopup(`<strong>${safeText(cfg.callsign || "Home")}</strong><br/>Home / QTH`)
      : null;

    const markers = [];
    for (const p of points) {
      const m = L.marker([p.lat, p.lon]).addTo(map);
      m.bindPopup(
        `<strong>${safeText(p.call || "")}</strong><br/>${safeText(p.band || "")} · ${safeText(p.mode || "")}<br/>${fmtUTC(p.time_utc || p.time || p.date)}`
      );
      markers.push(m);
    }

    const meta = byId("mapMeta");
    if (meta) meta.textContent = `Marker: ${markers.length}${homeMarker ? " (+Home)" : ""}`;

    const openLink = byId("mapOpenLink");
    if (openLink) {
      const url = hasHome
        ? `https://www.openstreetmap.org/?mlat=${encodeURIComponent(lat)}&mlon=${encodeURIComponent(lon)}#map=${encodeURIComponent(zoom)}/${encodeURIComponent(lat)}/${encodeURIComponent(lon)}`
        : "https://www.openstreetmap.org/";
      openLink.href = url;
    }

    // Fit bounds if we have QSO points
    if (points.length) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lon]));
      map.fitBounds(bounds.pad(0.25));
    }
  };

  (async function boot() {
    const cfg = await waitForOptionalConfig();

    const callsign = cfg.callsign || "DN9DKN";
    setText("callsignText", callsign);
    setText("callsignH1", callsign);
    setText("callsignFooter", callsign);

    setText("taglineText", safeText(cfg.tagline || ""));
    setText("dxccText", safeText(cfg.qth || "Germany"));
    setText("qthText", safeText(cfg.qth || "—"));
    setText("gridText", safeText(cfg.grid || "—"));
    setText("gridText2", safeText(cfg.grid || "—"));

    const lat = Number(cfg.coords?.lat);
    const lon = Number(cfg.coords?.lon);
    const coords = (Number.isFinite(lat) && Number.isFinite(lon))
      ? `${lat.toFixed(6)}, ${lon.toFixed(6)}`
      : "—";
    setText("coordsText", coords);

    setText("rigText", safeText(cfg.rig || "—"));
    setText("qslText", safeText(cfg.qslText || "—"));

    // About text
    const aboutEl = byId("aboutText");
    if (aboutEl && cfg.aboutHtml) {
      aboutEl.innerHTML = cfg.aboutHtml;
    } else if (aboutEl && cfg.aboutText) {
      aboutEl.textContent = cfg.aboutText;
    }

    // Links
    setHrefOrHide("qrzLink", cfg.links?.qrz || "https://www.qrz.com/db/" + encodeURIComponent(callsign));
    setHrefOrHide("wavelogLink", cfg.links?.wavelog || "");
    setHrefOrHide("clublogLink", cfg.links?.clublog || "");
    setHrefOrHide("lotwLink", cfg.links?.lotw || "");
    setHrefOrHide("eqslLink", cfg.links?.eqsl || "");

    // Mail (assembled)
    const mail = buildMail(cfg);
    const mailEls = [byId("mailLink"), byId("mailLink2")].filter(Boolean);
    for (const el of mailEls) {
      el.textContent = mail;
      el.href = `mailto:${mail}`;
    }

    // Year
    setText("year", String(new Date().getFullYear()));

    // Awards
    renderAwards(cfg.awards || []);

    // QSOs + map
    const qsos = await loadQsos(cfg);
    renderQsoTable(qsos);
    initMap(cfg, qsos);
  })();
})();
