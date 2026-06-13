# FABLUXE Visitor Management App — Setup Guide

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add Project** → Name it `fabluxe-vms`
3. Enable **Google Analytics** (optional)

## Step 2: Enable Firebase Services

### Authentication
- Firebase Console → Authentication → Sign-in method
- Enable **Email/Password**

### Firestore Database
- Firebase Console → Firestore Database → Create database
- Start in **production mode**
- Choose a region close to India (e.g., `asia-south1`)

## Step 3: Add Firebase Config to App

1. Firebase Console → Project Settings → Your apps → Add app → Web
2. Copy the config object
3. Paste it into `src/config/firebase.js`

## Step 4: Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null;
    }
    match /visitors/{visitorId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 5: Create Staff Accounts

In Firebase Console → Authentication → Users → Add user:
- Admin: admin@fabluxe.com / YourPassword
- Receptionist: reception@fabluxe.com / YourPassword
- Manager: manager@fabluxe.com / YourPassword

Then in Firestore → users collection, create a document for each user:
```
Document ID: (paste the UID from Authentication)
Fields:
  name: "Admin Name"
  email: "admin@fabluxe.com"
  role: "admin"   ← or "receptionist" or "manager"
```

## Step 6: Run the App

```bash
cd fabluxe
npm install
npx expo start
```

Scan the QR code with **Expo Go** app on your phone (Android/iOS).

## Roles & Permissions

| Feature          | Admin | Manager | Receptionist |
|-----------------|-------|---------|--------------|
| Check-in visitor | ✅   | ✅      | ✅           |
| View all visitors| ✅   | ✅      | ✅           |
| Update status   | ✅   | ✅      | ✅           |
| View reports    | ✅   | ✅      | ❌           |
| Manage staff    | ✅   | ❌      | ❌           |
