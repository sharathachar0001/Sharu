import {
  collection, addDoc, getDocs, getDoc, doc,
  query, where, orderBy, updateDoc, Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const VISITORS = 'visitors';

export const VISIT_PURPOSES = [
  'General Enquiry', 'Kitchen Design', 'Living Room', 'Bedroom',
  'Bathroom', 'Full Home Interior', 'Commercial Project', 'Follow-up Visit',
];

export const VISIT_SOURCES = [
  'Walk-In', 'Instagram', 'Facebook', 'Google', 'Referral',
  'WhatsApp', 'Newspaper Ad', 'Hoarding', 'Previous Customer',
];

export const VISITOR_STATUS = {
  NEW: 'New',
  FOLLOW_UP: 'Follow Up',
  CONVERTED: 'Converted',
  NOT_INTERESTED: 'Not Interested',
};

export async function addVisitor(data) {
  const now = Timestamp.now();
  return addDoc(collection(db, VISITORS), {
    ...data,
    status: VISITOR_STATUS.NEW,
    createdAt: now,
    followUpDate: null,
    followUpNote: '',
    updatedAt: now,
  });
}

export async function getVisitorsByDate(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, VISITORS),
    where('createdAt', '>=', Timestamp.fromDate(start)),
    where('createdAt', '<=', Timestamp.fromDate(end)),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllVisitors(limitDays = 30) {
  const since = new Date();
  since.setDate(since.getDate() - limitDays);

  const q = query(
    collection(db, VISITORS),
    where('createdAt', '>=', Timestamp.fromDate(since)),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getFollowUps() {
  const q = query(
    collection(db, VISITORS),
    where('status', 'in', [VISITOR_STATUS.NEW, VISITOR_STATUS.FOLLOW_UP]),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateVisitorStatus(id, status, followUpNote = '') {
  await updateDoc(doc(db, VISITORS, id), {
    status,
    followUpNote,
    updatedAt: Timestamp.now(),
  });
}

export async function setFollowUpDate(id, date, note = '') {
  await updateDoc(doc(db, VISITORS, id), {
    followUpDate: Timestamp.fromDate(new Date(date)),
    followUpNote: note,
    status: VISITOR_STATUS.FOLLOW_UP,
    updatedAt: Timestamp.now(),
  });
}
