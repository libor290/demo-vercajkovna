# Vercajkovna Demo App

Vue + PrimeVue demo klient pro Vercajkovnu.

## Co tu je

- `src/` - nový Vue klient
- `server.py` - Python API server pro Figma proxy endpointy
- `demo-client.zip` - referenční template, ze kterého beru styl a layout
- starší `app.js` / `styles.css` - legacy verze původního zero-build klienta

## Spuštění

1. Nainstaluj závislosti:

```zsh
npm install
```

2. Spusť Figma proxy server:

```zsh
export FIGMA_ACCESS_TOKEN="tvuj_token"
export FIGMA_FILE_KEY="SB3rKj1eJNqOZ57vyW02H3"
python3 server.py
```

3. Spusť Vue klienta:

```zsh
npm run dev
```

4. Otevři:

```text
http://127.0.0.1:6856
```

## Poznámka k API

- Vite klient proxyuje `/api/*` na `http://127.0.0.1:4173`
- tím pádem zůstává Figma integrace v Python serveru beze změn

## Demo flow

- přihlášení / registrace
- katalog nabídek
- detail nabídky
- žádost o půjčení
- stav žádosti
- profil
