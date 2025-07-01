export const COLLECTION_KEY = 'cardCollection';

export function saveCollection(collection: any[]) {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
  }
}

export function loadCollection(): any[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(COLLECTION_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
  }
  return [];
}

export function clearCollection() {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(COLLECTION_KEY);
  }
} 