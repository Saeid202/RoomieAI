// Shared in-memory wallet store — bridges tenant payment to landlord wallet
// This is a session-level store that works without DB tables being set up.
// When DB is ready, both sides will read from wallet_accounts instead.

type Listener = (balance: number) => void;

interface WalletEntry {
  balance: number; // in cents
  listeners: Listener[];
}

const store = new Map<string, WalletEntry>();

function getEntry(userId: string): WalletEntry {
  if (!store.has(userId)) {
    store.set(userId, { balance: 0, listeners: [] });
  }
  return store.get(userId)!;
}

export const WalletStore = {
  getBalance(userId: string): number {
    return getEntry(userId).balance;
  },

  setBalance(userId: string, cents: number) {
    const entry = getEntry(userId);
    entry.balance = cents;
    entry.listeners.forEach(fn => fn(cents));
  },

  addBalance(userId: string, cents: number) {
    const entry = getEntry(userId);
    entry.balance += cents;
    entry.listeners.forEach(fn => fn(entry.balance));
  },

  deductBalance(userId: string, cents: number): boolean {
    const entry = getEntry(userId);
    if (entry.balance < cents) return false;
    entry.balance -= cents;
    entry.listeners.forEach(fn => fn(entry.balance));
    return true;
  },

  subscribe(userId: string, fn: Listener): () => void {
    const entry = getEntry(userId);
    entry.listeners.push(fn);
    // Return unsubscribe
    return () => {
      entry.listeners = entry.listeners.filter(l => l !== fn);
    };
  },

  // Transfer from tenant to landlord atomically
  transfer(fromUserId: string, toUserId: string, cents: number): boolean {
    const from = getEntry(fromUserId);
    if (from.balance < cents) return false;
    from.balance -= cents;
    from.listeners.forEach(fn => fn(from.balance));
    const to = getEntry(toUserId);
    to.balance += cents;
    to.listeners.forEach(fn => fn(to.balance));
    return true;
  }
};
