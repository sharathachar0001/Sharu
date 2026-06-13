import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const ROLES = {
  ADMIN: 'admin',
  RECEPTIONIST: 'receptionist',
  MANAGER: 'manager',
};

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
  if (!userDoc.exists()) throw new Error('User profile not found.');
  return { uid: cred.user.uid, email: cred.user.email, ...userDoc.data() };
}

export async function logout() {
  await signOut(auth);
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      callback(userDoc.exists() ? { uid: user.uid, ...userDoc.data() } : null);
    } else {
      callback(null);
    }
  });
}

// Run once to seed an admin user after Firebase Auth creates them
export async function createUserProfile(uid, name, role, email) {
  await setDoc(doc(db, 'users', uid), { name, role, email, createdAt: new Date() });
}
