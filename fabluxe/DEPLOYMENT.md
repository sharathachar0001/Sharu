# 🚀 FABLUXE — Free Deployment Guide

A step-by-step guide to get the FABLUXE app running on your team's phones — **for free**.

There are **3 levels**. Most showrooms only need Level 1 + Level 2.

---

## ✅ Before You Start — One-Time Setup

You need to fill in two config files (the app won't work without these):

### 1. Firebase (your free cloud database)
1. Go to https://console.firebase.google.com → **Add project** → name it `fabluxe`.
2. Click **Build → Firestore Database → Create database** → Start in **production mode**.
3. Click **Build → Authentication → Get started → Email/Password → Enable**.
4. Click the **⚙️ gear → Project settings → Your apps → Web app (`</>`)** → register app.
5. Copy the `firebaseConfig` values into **`src/config/firebase.js`** (replace all the `YOUR_...` placeholders).

### 2. WhatsApp (Twilio — free sandbox)
*Only needed for greeting messages + EOD reports. You can skip and add later.*
1. Sign up at https://www.twilio.com/try-twilio (free trial).
2. Go to **Messaging → Try it out → WhatsApp sandbox**, follow the join step.
3. Copy your **Account SID**, **Auth Token**, and sandbox number into **`src/config/eodConfig.js`**.

> 💡 Create your first **admin login**: in Firebase → Authentication → Add user (email + password).
> Then log in to the app as Admin and add staff (name + PIN) from the **Staff** tab.

---

## 📲 LEVEL 1 — Test Instantly with Expo Go (0 cost, 2 minutes)

Best for trying the app and daily use on a few phones.

1. Install **Node.js** on your computer: https://nodejs.org (LTS version).
2. Install **Expo Go** on each phone (Play Store / App Store).
3. On your computer, open a terminal in the project folder and run:
   ```bash
   npm install
   npx expo start
   ```
4. A **QR code** appears. Open **Expo Go** on the phone → **Scan QR code**.
5. The app loads live. 🎉

> Note: this needs your computer running. Good for testing — for a standalone app that
> works without a computer, do Level 2.

---

## 📦 LEVEL 2 — Build a Free APK (install like a normal app)

This creates a real `.apk` file you can install on any Android phone — no computer needed afterwards. Expo's **EAS Build** free tier covers this.

1. Create a **free Expo account**: https://expo.dev/signup
2. In your terminal (project folder), install the build tool and log in:
   ```bash
   npm install -g eas-cli
   eas login
   ```
3. Link the project (run once):
   ```bash
   eas build:configure
   ```
4. Build the Android APK (free queue):
   ```bash
   eas build -p android --profile preview
   ```
5. Wait ~10–20 min. EAS gives you a **download link** to the `.apk`.
6. Open that link on each Android phone → download → install (allow "install from unknown sources").
7. Done — FABLUXE is now a normal app icon on the phone. ✅

> 🔁 To update later: change code, bump `version` in `app.json`, run the build command again, re-install.

---

## 🏪 LEVEL 3 — Google Play Store (optional, one-time $25)

Only if you want it publicly listed / auto-updates via Play Store.

1. Pay the one-time **$25** Google Play Developer fee: https://play.google.com/console
2. Build a release bundle:
   ```bash
   eas build -p android --profile production
   ```
3. Submit it:
   ```bash
   eas submit -p android --latest
   ```
4. Fill in the Play Console listing (name, screenshots, privacy policy) → submit for review.

> iPhone/App Store requires an Apple Developer account ($99/year) — skip unless you need iOS.

---

## 💰 Cost Summary

| Level | What you get | Cost |
|-------|--------------|------|
| 1 — Expo Go | Live testing on phones | **Free** |
| 2 — EAS APK | Standalone installable app | **Free** |
| 3 — Play Store | Public listing + auto-updates | **$25 once** |
| Firebase | Database + login | **Free** (Spark plan) |
| Twilio WhatsApp | Greetings + EOD reports | **Free** sandbox / pay-as-you-go for production |

---

## 🆘 Common Issues

- **White screen / "Firebase error"** → you haven't filled `src/config/firebase.js`.
- **Greeting won't send** → Twilio not configured in `src/config/eodConfig.js`, or visitor (in sandbox) hasn't joined the WhatsApp sandbox.
- **Fonts look plain** → run `npm install` again so `@expo-google-fonts` packages download.
- **`eas` command not found** → run `npm install -g eas-cli` again.

---

**Recommended path for FABLUXE:** Do the one-time setup → **Level 2 (free APK)** → install on your reception + sales phones. That's a fully working, free, standalone app.
