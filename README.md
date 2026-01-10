# DN9DKN Website (GitHub Repo · Hosting auf NAS)

Dieses Repo enthält die **funktionierende** DN9DKN-Webseite (QSL-Infos, DE/EN, On-Air Widget, Link zur QSO-Karte).

- Live-Domain: **https://www.dn9dkn.de/**
- Hosting: dein NAS (Webserver)
- GitHub: Quellcode / Versionsverwaltung

> Hinweis: `index.html` basiert auf deiner aktuellen funktionierenden Version.

## Deployment auf das NAS

### A) Manuell (einfach)
1. Repo auf dem NAS klonen (Beispielpfad):
   ```bash
   cd /volume1/web/
   git clone https://github.com/DEINNAME/dn9dkn-website.git dn9dkn
   ```
2. Webserver-Root auf den Ordner zeigen lassen (z. B. `/volume1/web/dn9dkn/`).
3. Updates:
   ```bash
   cd /volume1/web/dn9dkn
   git pull
   ```

### B) Automatisch (optional) – GitHub Actions → NAS (rsync/SSH)
Im Repo liegt: `.github/workflows/deploy-to-nas.yml`

Lege in GitHub unter **Settings → Secrets and variables → Actions** diese Secrets an:

- `NAS_HOST` (z. B. `example.dyndns.org` oder deine feste IP)
- `NAS_USER` (SSH-User)
- `NAS_TARGET_PATH` (z. B. `/volume1/web/dn9dkn/`)
- `NAS_SSH_KEY` (privater SSH-Key, z. B. ed25519)

Dann wird bei jedem Push auf `main` automatisch deployt.

## Domain / DNS

Typischer Aufbau:

- `A` (oder `AAAA`) Record für `www` → öffentliche IP  
  oder `CNAME www` → auf deinen DDNS-Namen (falls vorhanden)
- Optional: Root-Domain `dn9dkn.de` → Redirect auf `www` (oder umgekehrt)

## Mailto (Spam-schonend)

In `index.html` werden alle `mailto:?` Links am Ende per kleinem JS automatisch um den Empfänger ergänzt
(**qsl@dn9dkn.de**). Dadurch steht die Adresse **nicht** als Klartext im HTML, aber der Klick funktioniert.

Wenn du das nicht willst: Script-Block `id="dn9dkn-mailto"` einfach entfernen.

## Lizenz

MIT – siehe `LICENSE`.
