import { adminDb } from './admin';
import type {
  Interaction,
  InteractionStatus,
  RoutingOutcome,
  EmailClassification,
} from '@/types';

const COLLECTION = 'interactions';

export async function createInteraction(
  data: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = adminDb();
  const now = new Date();
  const ref = await db.collection(COLLECTION).add({
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function getInteraction(id: string): Promise<Interaction | null> {
  const db = adminDb();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;

  const data = doc.data()!;
  return {
    id: doc.id,
    ...data,
    receivedAt: data.receivedAt?.toDate?.() || new Date(data.receivedAt),
    classifiedAt: data.classifiedAt?.toDate?.() || data.classifiedAt,
    respondedAt: data.respondedAt?.toDate?.() || data.respondedAt,
    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
  } as Interaction;
}

export async function updateInteractionStatus(
  id: string,
  status: InteractionStatus,
  extra?: Partial<Interaction>
): Promise<void> {
  const db = adminDb();
  await db
    .collection(COLLECTION)
    .doc(id)
    .update({
      status,
      ...extra,
      updatedAt: new Date(),
    });
}

export async function updateInteractionClassification(
  id: string,
  classification: EmailClassification
): Promise<void> {
  const db = adminDb();
  await db.collection(COLLECTION).doc(id).update({
    classification,
    status: 'classified' as InteractionStatus,
    classifiedAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateInteractionRouting(
  id: string,
  routingOutcome: RoutingOutcome,
  extra?: Partial<Interaction>
): Promise<void> {
  const db = adminDb();
  await db
    .collection(COLLECTION)
    .doc(id)
    .update({
      routingOutcome,
      ...extra,
      updatedAt: new Date(),
    });
}

export async function getRecentInteractions(
  limit = 50
): Promise<Interaction[]> {
  const db = adminDb();
  const snapshot = await db
    .collection(COLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      receivedAt: data.receivedAt?.toDate?.() || new Date(data.receivedAt),
      classifiedAt: data.classifiedAt?.toDate?.() || data.classifiedAt,
      respondedAt: data.respondedAt?.toDate?.() || data.respondedAt,
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
    } as Interaction;
  });
}

export async function getTodayStats() {
  const db = adminDb();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const snapshot = await db
    .collection(COLLECTION)
    .where('createdAt', '>=', startOfDay)
    .get();

  const interactions = snapshot.docs.map((d) => d.data());

  return {
    emailsToday: interactions.length,
    autoReplied: interactions.filter((i) => i.routingOutcome === 'auto_replied')
      .length,
    escalated: interactions.filter(
      (i) => i.routingOutcome === 'escalated_techsupport'
    ).length,
    pending: interactions.filter(
      (i) => i.status === 'received' || i.status === 'classifying'
    ).length,
    avgResponseTimeMs: calculateAvgResponseTime(interactions),
  };
}

function calculateAvgResponseTime(
  interactions: FirebaseFirestore.DocumentData[]
): number {
  const responded = interactions.filter((i) => i.respondedAt && i.receivedAt);
  if (responded.length === 0) return 0;

  const totalMs = responded.reduce((sum, i) => {
    const received = i.receivedAt?.toDate?.()
      ? i.receivedAt.toDate().getTime()
      : new Date(i.receivedAt).getTime();
    const respondedAt = i.respondedAt?.toDate?.()
      ? i.respondedAt.toDate().getTime()
      : new Date(i.respondedAt).getTime();
    return sum + (respondedAt - received);
  }, 0);

  return Math.round(totalMs / responded.length);
}
