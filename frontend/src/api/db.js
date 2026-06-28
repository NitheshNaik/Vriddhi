import Dexie from 'dexie';

export const db = new Dexie('VriddhiLocalDB');

db.version(1).stores({
  inventory: '_id, name, category, quantity, price'
});

// Explicitly trigger execution immediately when this module is imported anywhere in the app
db.open().catch(err => console.error("IndexedDB raw open error:", err));
