import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  GREETING_TEMPLATES, ACTIVE_TEMPLATE, ASK_BEFORE_SEND, ALLOW_ALL_STAFF,
} from '../config/greetingConfig';

const SETTINGS = 'settings';
const GREETING_DOC = 'greeting';

// Built-in defaults (used until an admin saves custom settings).
export function defaultGreetingSettings() {
  return {
    activeTemplate: ACTIVE_TEMPLATE,
    askBeforeSend: ASK_BEFORE_SEND,
    allowAllStaff: ALLOW_ALL_STAFF,
    // The editable message for each template key.
    messages: Object.fromEntries(
      Object.entries(GREETING_TEMPLATES).map(([k, v]) => [k, v.message])
    ),
    labels: Object.fromEntries(
      Object.entries(GREETING_TEMPLATES).map(([k, v]) => [k, v.label])
    ),
  };
}

// Simple in-memory cache so sending greetings doesn't re-fetch every time.
let cache = null;

// ─── Load greeting settings (Firestore → merged with defaults) ───────────────
export async function getGreetingSettings({ force = false } = {}) {
  if (cache && !force) return cache;
  const defaults = defaultGreetingSettings();
  try {
    const snap = await getDoc(doc(db, SETTINGS, GREETING_DOC));
    if (snap.exists()) {
      const saved = snap.data();
      cache = {
        ...defaults,
        ...saved,
        messages: { ...defaults.messages, ...(saved.messages || {}) },
        labels: { ...defaults.labels, ...(saved.labels || {}) },
      };
      return cache;
    }
  } catch (e) {
    // Offline / not configured — fall back to defaults.
  }
  cache = defaults;
  return cache;
}

// ─── Save greeting settings (admin only) ─────────────────────────────────────
export async function saveGreetingSettings(settings) {
  await setDoc(doc(db, SETTINGS, GREETING_DOC), settings, { merge: true });
  cache = settings;
  return settings;
}
