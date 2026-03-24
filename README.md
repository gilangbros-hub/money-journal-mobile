# Money Journal Mobile (Native React Native App)

This repository contains the fully native React Native variant of the Catat Boros / Money Journal web application. Built using Expo, this app interacts with the existing Express.js REST API while keeping a flawless native mobile experience.

## ✨ Features
- **Fully Native Architecture**: Built on React Native using Expo SDK.
- **NativeWind Styling**: Uses Tailwind CSS v3 tokens integrated seamlessly with native layers ensuring the "Tropis Neon" dark theme thrives everywhere.
- **Axios Networking**: Secure connection handling session cookies inherently compatible with the Express.js endpoints.

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- Expo CLI or Expo Go installed on your physical device.

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start the Metro Bundler:
```bash
npm start
```
*Note: To clear Metro cache, run `npm start -c`*

3. Scan the QR code presented in your terminal with the Expo Go app.

## 🏗️ Architecture Phases
This app was engineered in 5 distinct phases:
1. Foundation & Authentication Setup
2. Core Dashboard & Layout
3. Transaction Management & Form Mutations
4. Budget Tracking & User Profile
5. Build & Deployment (APK/AAB) via EAS
