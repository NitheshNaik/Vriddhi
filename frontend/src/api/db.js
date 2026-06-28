import Dexie from 'dexie';

export const db = new Dexie('VriddhiLocalDB');

db.version(1).stores({ 
  inventory: '_id, name, category, quantity, price, sellingPrice, photo' 
});
