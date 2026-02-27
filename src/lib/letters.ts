export interface Letter {
  id: string;
  title: string;
  body: string;
  sentDate: string;
  deliveryDate: string;
  isLocked: boolean;
  recipientPhone?: string;
  recipientName?: string;
  status: "sent" | "delivered";
}

export function calculateProgress(sentDate: string, deliveryDate: string): number {
  const now = new Date();
  const sent = new Date(sentDate);
  const delivery = new Date(deliveryDate);
  const total = delivery.getTime() - sent.getTime();
  const elapsed = now.getTime() - sent.getTime();
  if (total <= 0) return 1;
  return Math.min(Math.max(elapsed / total, 0), 1);
}

export function isDelivered(deliveryDate: string): boolean {
  return new Date() >= new Date(deliveryDate);
}

export function getCountdownText(deliveryDate: string): string {
  const now = new Date();
  const delivery = new Date(deliveryDate);
  const diffMs = delivery.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Delivering today";
  if (days === 1) return "Delivers tomorrow";
  return `Delivers in ${days} days`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const SENT_KEY = "sent_letters";
const RECEIVED_KEY = "received_letters";
const UNREAD_KEY = "unread_received_ids";

export function getSentLetters(): Letter[] {
  const raw = localStorage.getItem(SENT_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveSentLetter(letter: Letter) {
  const letters = getSentLetters();
  letters.unshift(letter);
  localStorage.setItem(SENT_KEY, JSON.stringify(letters));
}

export function deleteSentLetter(id: string) {
  const letters = getSentLetters().filter((l) => l.id !== id);
  localStorage.setItem(SENT_KEY, JSON.stringify(letters));
}

export function deleteReceivedLetter(id: string) {
  const letters = getReceivedLetters().filter((l) => l.id !== id);
  localStorage.setItem(RECEIVED_KEY, JSON.stringify(letters));
}
export function getReceivedLetters(): Letter[] {
  const raw = localStorage.getItem(RECEIVED_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveReceivedLetter(letter: Letter) {
  const letters = getReceivedLetters();
  letters.unshift(letter);
  localStorage.setItem(RECEIVED_KEY, JSON.stringify(letters));
}

export function getUnreadCount(): number {
  const raw = localStorage.getItem(UNREAD_KEY);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  return ids.length;
}

export function addUnreadId(id: string) {
  const raw = localStorage.getItem(UNREAD_KEY);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(UNREAD_KEY, JSON.stringify(ids));
  }
}

export function clearUnread() {
  localStorage.setItem(UNREAD_KEY, JSON.stringify([]));
}

// Check sent letters and move delivered ones to received
export function processDeliveries(): Letter[] {
  const sent = getSentLetters();
  const received = getReceivedLetters();
  const receivedIds = new Set(received.map((l) => l.id));
  const newlyDelivered: Letter[] = [];

  const remaining: Letter[] = [];
  for (const letter of sent) {
    if (isDelivered(letter.deliveryDate) && !receivedIds.has(letter.id)) {
      const delivered = { ...letter, status: "delivered" as const, isLocked: false };
      newlyDelivered.push(delivered);
    } else {
      remaining.push(letter);
    }
  }

  if (newlyDelivered.length > 0) {
    const updatedReceived = [...newlyDelivered, ...received];
    localStorage.setItem(RECEIVED_KEY, JSON.stringify(updatedReceived));
    localStorage.setItem(SENT_KEY, JSON.stringify(remaining));
    for (const l of newlyDelivered) {
      addUnreadId(l.id);
    }
  }

  return newlyDelivered;
}
