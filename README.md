# Skin Assistant

A mobile app, built with [Expo](https://expo.dev), that gives AI-generated educational insights about skin concerns. You take a photo, describe your symptoms in English, Kurdish, or another language, and Google Gemini returns a structured analysis.

> **Medical disclaimer:** Skin Assistant is an educational tool, not a medical device, and it does not provide a diagnosis. See a dermatologist or doctor about any skin concern, especially if symptoms get worse.

## How it works

1. **Choose a mode** (`app/index.tsx`): **Analyze Face** or **Analyze Body**.
2. **Take a photo** (`app/camera.tsx`): in face mode, ML Kit detects the largest face on the device and crops the photo to it. If no face is found or detection fails, the full photo is used. Body mode always uses the full photo.
3. **Describe your symptoms** (`app/form.tsx`).
4. **Read the results** (`app/results.tsx`): the photo and description are sent to the Gemini 2.5 Flash API. The screen then shows:
   - an urgency level
   - visual observations
   - potential matches
   - care suggestions
   - ingredients to look for
   - a medical disclaimer

## Prerequisites

- Node.js and npm
- A [Gemini API key](https://aistudio.google.com/apikey)
- An Android device or emulator, or an iOS device or simulator. The iOS simulator has no camera, so use a physical device to test the capture flow.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add your Gemini API key by replacing the `GEMINI_API_KEY` placeholder at the top of `app/results.tsx`.

   **Do not commit a real key.** Revert this change before you commit. See [API key handling](#api-key-handling).

3. Build and run a [development build](https://docs.expo.dev/develop/development-builds/introduction/):

   ```bash
   npx expo run:android
   # or
   npx expo run:ios
   ```

   Face detection uses `@react-native-ml-kit/face-detection`, a native module that isn't included in Expo Go, so use a development build rather than Expo Go.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Starts the Expo dev server |
| `npm run android` | Starts the dev server and opens Android |
| `npm run ios` | Starts the dev server and opens iOS |
| `npm run lint` | Runs ESLint through Expo |

`npm run reset-project` is left over from the Expo starter template and is meant to clear out the `app` directory. Don't run it unless you intend to start over.

## Privacy

Face detection and cropping happen on the device. The final photo and the symptom description are then sent to Google's Gemini API for analysis, so review [Google's terms](https://ai.google.dev/gemini-api/terms) before using real health images.

## API key handling

The app calls Gemini directly from the device, using a key set in `app/results.tsx`. This setup is only suitable for local development, because any key shipped in an app bundle can be extracted from it. Before a public release, send requests through a backend that holds the key.

## Project structure

```text
app/
  _layout.tsx    Navigation stack
  index.tsx      Mode selection
  camera.tsx     Photo capture and face cropping
  form.tsx       Symptom description
  results.tsx    Gemini request and results display
assets/          Icons and images
scripts/         Starter template tooling
```

## Tech stack

Expo SDK 57, React Native, Expo Router, TypeScript, Expo Camera, Google ML Kit face detection, and the Gemini API.

## License

[MIT](LICENSE)
