# CDR Analytics - Application Mobile

Application mobile Expo / React Native (TypeScript) pour consulter les CDR (Call Detail Records) via l'API web service CDR Analytics.

## Prerequis

| Outil | Version minimale | Installation |
|-------|-----------------|--------------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | inclus avec Node.js |
| Expo CLI | derniere version | `npm install -g expo-cli` |
| EAS CLI | derniere version | `npm install -g eas-cli` |
| Git | 2+ | https://git-scm.com |
| Xcode | 15+ (macOS uniquement) | App Store |
| Android Studio | Hedgehog+ | https://developer.android.com/studio |
| JDK | 17 | inclus avec Android Studio |

## Installation

```bash
cd CDRApp
npm install
```

## Lancement en developpement

### Demarrer le serveur Metro

```bash
npx expo start
```

Options au lancement :
- Appuyer sur `a` → ouvrir sur Android (emulateur ou appareil)
- Appuyer sur `i` → ouvrir sur iOS (simulateur)
- Appuyer sur `w` → ouvrir dans le navigateur web

### Lancer directement sur une plateforme

```bash
# Android (emulateur ou appareil connecte)
npx expo start --android

# iOS (simulateur macOS uniquement)
npx expo start --ios

# Web (navigateur)
npx expo start --web
```

### Tester sur un appareil physique

1. Installer **Expo Go** depuis le Play Store / App Store
2. Scanner le QR code affiche dans le terminal
3. L'app se charge automatiquement

---

## Builds de production (EAS Build)

EAS Build compile l'app dans le cloud. Pas besoin d'Android Studio ou Xcode en local.

### Configuration initiale (une seule fois)

```bash
# Se connecter a Expo
npx eas login

# Initialiser EAS dans le projet
npx eas build:configure
```

Cela cree un fichier `eas.json`. Voici la configuration recommandee :

```json
{
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

### Android - APK

```bash
# APK de test (installation directe)
npx eas build --platform android --profile preview
```

Le lien de telechargement de l'APK s'affiche a la fin du build.

### Android - AAB (Google Play Store)

```bash
# Bundle de production pour le Play Store
npx eas build --platform android --profile production
```

### Publier sur le Google Play Store

```bash
npx eas submit --platform android --profile production
```

> Prerequis : avoir un compte Google Play Console et un fichier de cle de service JSON configure dans `eas.json`.

---

### iOS - Simulateur

```bash
npx eas build --platform ios --profile development
```

### iOS - IPA (App Store / TestFlight)

```bash
# Build de production
npx eas build --platform ios --profile production
```

### Publier sur l'App Store / TestFlight

```bash
npx eas submit --platform ios --profile production
```

> Prerequis : avoir un compte Apple Developer ($99/an) et configurer les credentials via `npx eas credentials`.

---

### Web - Build statique

```bash
# Generer le build web
npx expo export --platform web
```

Les fichiers sont generes dans le dossier `dist/`. Pour les deployer :

```bash
# Servir en local pour tester
npx serve dist

# Deployer sur Netlify
npx netlify deploy --prod --dir=dist

# Deployer sur Vercel
npx vercel dist
```

---

### macOS - DMG (via Electron)

Expo ne genere pas de DMG nativement. Pour creer un .dmg a partir du build web :

```bash
# 1. Generer le build web
npx expo export --platform web

# 2. Installer electron-packager
npm install -g electron-packager electron

# 3. Creer le wrapper Electron
mkdir electron-wrapper
```

Creer `electron-wrapper/main.js` :

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 420,
    height: 800,
    title: 'CDR Analytics',
    webPreferences: { nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.on('window-all-closed', () => app.quit());
```

Creer `electron-wrapper/package.json` :

```json
{
  "name": "cdr-analytics-desktop",
  "version": "1.0.0",
  "main": "main.js"
}
```

```bash
# 4. Packager pour macOS
electron-packager electron-wrapper "CDR Analytics" --platform=darwin --arch=x64 --out=builds

# 5. Creer le DMG (necessite create-dmg)
brew install create-dmg
create-dmg \
  --volname "CDR Analytics" \
  --window-size 500 300 \
  --app-drop-link 380 100 \
  "CDR-Analytics.dmg" \
  "builds/CDR Analytics-darwin-x64/CDR Analytics.app"
```

---

### Windows - EXE

Meme principe que macOS, avec Electron :

```bash
# Packager pour Windows (depuis macOS ou Windows)
electron-packager electron-wrapper "CDR Analytics" --platform=win32 --arch=x64 --out=builds
```

---

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `npx expo start` | Demarrer le serveur de dev |
| `npx expo start --clear` | Demarrer en vidant le cache |
| `npx expo start --android` | Lancer sur Android |
| `npx expo start --ios` | Lancer sur iOS |
| `npx expo start --web` | Lancer sur le web |
| `npx eas build --platform android --profile preview` | Build APK |
| `npx eas build --platform android --profile production` | Build AAB (Play Store) |
| `npx eas build --platform ios --profile production` | Build IPA (App Store) |
| `npx expo export --platform web` | Build web statique |
| `npx eas submit --platform android` | Publier Play Store |
| `npx eas submit --platform ios` | Publier App Store |
| `npx tsc --noEmit` | Verifier les types TypeScript |

## Structure du projet

```
CDRApp/
├── App.tsx                            # Point d'entree
├── app.json                           # Configuration Expo
├── eas.json                           # Configuration EAS Build
├── package.json
├── tsconfig.json
├── assets/                            # Icones et splash screen
└── src/
    ├── types/index.ts                 # Interfaces TypeScript
    ├── services/api.ts                # Appels API REST
    ├── contexts/
    │   ├── AuthContext.tsx             # Authentification JWT
    │   └── ThemeContext.tsx            # Mode dark/light
    ├── components/
    │   ├── DatePickerField.tsx         # Selecteur date/heure
    │   └── LoadingOverlay.tsx          # Overlay de chargement
    ├── navigation/
    │   └── AppNavigator.tsx            # Stack Navigator
    └── screens/
        ├── LoginScreen.tsx            # Connexion
        ├── HomeScreen.tsx             # Accueil
        ├── SearchNumberScreen.tsx     # Recherche par numero
        ├── SearchImeiScreen.tsx       # Recherche par IMEI
        └── ResultsScreen.tsx          # Affichage resultats
```

## API consommee

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/auth/login` | Authentification |
| GET | `/api/v1/auth/me` | Verifier le token |
| POST | `/api/v1/search/number` | Recherche CDR par numero (single/group/batch) |
| POST | `/api/v1/search/imei` | Recherche CDR par IMEI |

Base URL : configuree via la variable d'environnement `EXPO_PUBLIC_API_BASE_URL` (voir `.env.example`)

## Fonctionnalites

- Authentification JWT avec stockage securise (SecureStore / Keychain)
- Recherche par numero de telephone (simple ou multiple)
- Recherche par IMEI
- Affichage des resultats en JSON
- Telechargement et partage de fichiers PDF
- Mode dark / light (toggle + detection automatique du systeme)
- 100% TypeScript
