import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, collection, getDocs,
  query, where, deleteDoc, Timestamp,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  RECEPTIONIST: 'receptionist',
};

const SESSION_KEY = 'fabluxe_staff_session';

// ─── Simple PIN hash (not cryptographic, but enough for internal use) ─────────
function hashPin(pin) {
  let h = 0;
  for (let i = 0; i < pin.length; i++) {
    h = (Math.imul(31, h) + pin.charCodeAt(i)) | 0;
  }
  return String(Math.abs(h));
}

// ─── Admin login (Firebase Auth — email + password) ───────────────────────────
export async function adminLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
  if (!userDoc.exists()) throw new Error('Admin profile not found in database.');
  const user = { uid: cred.user.uid, isFirebaseUser: true, ...userDoc.data() };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

// ─── Staff login (Name + PIN — Firestore only) ────────────────────────────────
export async function staffLogin(name, pin) {
  if (!name.trim()) throw new Error('Please enter your name.');
  if (pin.length !== 4) throw new Error('PIN must be 4 digits.');

  const q = query(
    collection(db, 'staff'),
    where('nameLower', '==', name.trim().toLowerCase())
  );
  const snap = await getDocs(q);
  if (snap.empty) throw new Error(`No staff account found for "${name}". Ask your admin to create one.`);

  const staffDoc = snap.docs[0];
  const data = staffDoc.data();

  if (!data.active) throw new Error('Your account has been deactivated. Contact admin.');
  if (data.pinHash !== hashPin(pin)) throw new Error('Incorrect PIN. Please try again.');

  const user = {
    uid: staffDoc.id,
    name: data.name,
    role: data.role,
    isFirebaseUser: false,
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

// ─── Restore session on app start ─────────────────────────────────────────────
export async function restoreSession() {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout(isFirebaseUser = false) {
  await AsyncStorage.removeItem(SESSION_KEY);
  if (isFirebaseUser) await signOut(auth);
}

// ─── Admin: create/update staff (stored in Firestore 'staff' collection) ──────
export async function createStaff({ name, pin, role }) {
  if (!name.trim()) throw new Error('Name is required.');
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) throw new Error('PIN must be exactly 4 digits.');

  const id = name.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
  await setDoc(doc(db, 'staff', id), {
    name: name.trim(),
    nameLower: name.trim().toLowerCase(),
    role,
    pinHash: hashPin(pin),
    active: true,
    createdAt: Timestamp.now(),
  });
  return id;
}

export async function getAllStaff() {
  const snap = await getDocs(collection(db, 'staff'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateStaffPin(id, newPin) {
  if (newPin.length !== 4) throw new Error('PIN must be 4 digits.');
  await setDoc(doc(db, 'staff', id), { pinHash: hashPin(newPin) }, { merge: true });
}

export async function toggleStaffActive(id, active) {
  await setDoc(doc(db, 'staff', id), { active }, { merge: true });
}

export async function deleteStaff(id) {
  await deleteDoc(doc(db, 'staff', id));
}

// ─── Legacy Firebase Auth subscription (admin only) ───────────────────────────
export function subscribeToFirebaseAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// ─── Create admin profile in Firestore (run once after Firebase Auth signup) ──
export async function createAdminProfile(uid, name, email) {
  await setDoc(doc(db, 'users', uid), {
    name, email, role: ROLES.ADMIN, createdAt: Timestamp.now(),
  });
}
