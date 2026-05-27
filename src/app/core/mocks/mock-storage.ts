/**
 * sessionStorage-backed CRUD store for mock data.
 *
 * - Hydrates from sessionStorage at first access; otherwise uses the seed.
 * - Persists on every mutation so the same tab keeps changes across navigation.
 * - Sessions are isolated per browser tab. Closing the tab resets to seed.
 *
 * Exposes a `window.__mockReset(key?)` global for dev/debug — calling without
 * an argument clears all `mock:*` keys, with an argument only that one.
 */

const PREFIX = 'mock:';

interface MockEntity {
  id: string;
}

export interface MockStore<T extends MockEntity> {
  list(): T[];
  find(id: string): T | undefined;
  create(item: T): T;
  update(id: string, patch: Partial<T>): T | undefined;
  remove(id: string): boolean;
  /** Replace the entire collection (e.g. for bulk operations like duplication). */
  replaceAll(items: T[]): void;
  /** Reset to the original seed. */
  reset(): void;
}

const stores = new Map<string, MockStore<MockEntity>>();

export function mockStorage<T extends MockEntity>(key: string, seed: () => T[]): MockStore<T> {
  if (stores.has(key)) return stores.get(key)! as unknown as MockStore<T>;

  const storageKey = PREFIX + key;
  let data: T[];

  try {
    const raw = sessionStorage.getItem(storageKey);
    data = raw ? (JSON.parse(raw) as T[]) : seed();
  } catch {
    data = seed();
  }

  const persist = () => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      /* quota or unavailable — non-fatal */
    }
  };

  const store: MockStore<T> = {
    list: () => [...data],
    find: (id) => data.find((x) => x.id === id),
    create: (item) => {
      data = [item, ...data];
      persist();
      return item;
    },
    update: (id, patch) => {
      const existing = data.find((x) => x.id === id);
      if (!existing) return undefined;
      const merged = { ...existing, ...patch } as T;
      data = data.map((x) => (x.id === id ? merged : x));
      persist();
      return merged;
    },
    remove: (id) => {
      const before = data.length;
      data = data.filter((x) => x.id !== id);
      const removed = data.length !== before;
      if (removed) persist();
      return removed;
    },
    replaceAll: (items) => {
      data = [...items];
      persist();
    },
    reset: () => {
      data = seed();
      persist();
    },
  };

  stores.set(key, store as unknown as MockStore<MockEntity>);
  return store;
}

// Dev helper — call `__mockReset()` from the browser console to wipe all mock data.
if (typeof window !== 'undefined') {
  (window as unknown as { __mockReset: (key?: string) => void }).__mockReset = (key) => {
    if (key) {
      sessionStorage.removeItem(PREFIX + key);
      stores.delete(key);
      console.log(`[mock] reset ${key}`);
    } else {
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => sessionStorage.removeItem(k));
      stores.clear();
      console.log('[mock] reset all');
    }
  };
}
