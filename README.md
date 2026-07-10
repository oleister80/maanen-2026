# Månen 2026

Månen 2026 er en uoffisiell, mobiltilpasset festivalguide for Månefestivalen i Gamlebyen, Fredrikstad, 23.–25. juli 2026.

Nettsiden er laget med ren HTML, CSS og JavaScript. Programmet lastes fra en egen JSON-fil, og løsningen kan publiseres direkte med GitHub Pages uten byggesteg eller avhengigheter.

Brukere kan merke artister de ønsker å se og gi konsertene egne terningkast. Favoritter og vurderinger lagres lokalt i nettleseren og sendes ikke til noen server.

Guiden lenker også til en offentlig, uoffisiell Spotify-spilleliste med musikk fra festivalartistene.

> Uoffisiell festivalguide. Ikke tilknyttet eller godkjent av Månefestivalen.

## Kjør lokalt

Fordi programmet lastes med `fetch`, bør prosjektet åpnes via en enkel lokal webserver i stedet for å åpne `index.html` direkte.

Med Python:

```bash
python -m http.server 8000
```

Åpne deretter [http://localhost:8000](http://localhost:8000) i nettleseren.

## Filstruktur

```text
maanen-2026/
├── data/
│   └── program.json   # Festivalprogrammet
├── index.html         # Sidens innhold og struktur
├── styles.css         # Mobil-først design og responsiv layout
├── script.js          # Filtrering og rendering av programmet
└── README.md          # Prosjektdokumentasjon
```

## Publiser med GitHub Pages

1. Push filene til standardgrenen i GitHub-repositoriet.
2. Åpne **Settings → Pages** i repositoriet.
3. Under **Build and deployment**, velg **Deploy from a branch**.
4. Velg standardgrenen (vanligvis `main`) og mappen `/ (root)`.
5. Trykk **Save**. GitHub viser nettadressen når siden er publisert.

Alle filstier er relative, slik at siden fungerer når den publiseres under repository-navnet på GitHub Pages.
