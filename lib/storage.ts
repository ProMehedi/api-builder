import { promises as fs } from "fs";
import path from "path";
import type { Collection, CollectionItem } from "./types";
import { generateId } from "./types";

// Storage file paths
const DATA_DIR = path.join(process.cwd(), ".api-builder-data");
const COLLECTIONS_FILE = path.join(DATA_DIR, "collections.json");
const ITEMS_FILE = path.join(DATA_DIR, "items.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Directory exists
  }
}

// Read collections from file
async function readCollections(): Promise<Collection[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(COLLECTIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write collections to file
async function writeCollections(collections: Collection[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(COLLECTIONS_FILE, JSON.stringify(collections, null, 2));
}

// Read items from file
export async function readItems(): Promise<Record<string, CollectionItem[]>> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(ITEMS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Write items to file
async function writeItems(
  items: Record<string, CollectionItem[]>
): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(ITEMS_FILE, JSON.stringify(items, null, 2));
}

// Collection operations
export async function getCollectionBySlug(
  slug: string
): Promise<Collection | null> {
  const collections = await readCollections();
  return collections.find((c) => c.slug === slug) || null;
}

export async function getAllCollections(): Promise<Collection[]> {
  return readCollections();
}

export async function createCollection(
  collection: Collection
): Promise<Collection> {
  const collections = await readCollections();
  collections.push(collection);
  await writeCollections(collections);

  const items = await readItems();
  items[collection.id] = [];
  await writeItems(items);

  return collection;
}

export async function updateCollection(
  id: string,
  updates: Partial<Collection>
): Promise<Collection | null> {
  const collections = await readCollections();
  const index = collections.findIndex((c) => c.id === id);

  if (index === -1) return null;

  collections[index] = {
    ...collections[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await writeCollections(collections);
  return collections[index];
}

export async function deleteCollection(id: string): Promise<boolean> {
  const collections = await readCollections();
  const filtered = collections.filter((c) => c.id !== id);

  if (filtered.length === collections.length) return false;

  await writeCollections(filtered);

  const items = await readItems();
  delete items[id];
  await writeItems(items);

  return true;
}

// Item operations
export async function getItems(collectionId: string): Promise<CollectionItem[]> {
  const items = await readItems();
  return items[collectionId] || [];
}

export async function getItem(
  collectionId: string,
  itemId: string
): Promise<CollectionItem | null> {
  const items = await getItems(collectionId);
  return items.find((item) => item.id === itemId) || null;
}

export async function createItem(
  collectionId: string,
  data: Record<string, unknown>
): Promise<CollectionItem> {
  const now = new Date().toISOString();
  const item: CollectionItem = {
    id: generateId(),
    collectionId,
    data,
    createdAt: now,
    updatedAt: now,
  };

  const allItems = await readItems();
  if (!allItems[collectionId]) {
    allItems[collectionId] = [];
  }
  allItems[collectionId].push(item);
  await writeItems(allItems);

  return item;
}

export async function updateItem(
  collectionId: string,
  itemId: string,
  data: Record<string, unknown>
): Promise<CollectionItem | null> {
  const allItems = await readItems();
  const items = allItems[collectionId] || [];
  const index = items.findIndex((item) => item.id === itemId);

  if (index === -1) return null;

  items[index] = {
    ...items[index],
    data,
    updatedAt: new Date().toISOString(),
  };

  allItems[collectionId] = items;
  await writeItems(allItems);

  return items[index];
}

export async function deleteItem(
  collectionId: string,
  itemId: string
): Promise<boolean> {
  const allItems = await readItems();
  const items = allItems[collectionId] || [];
  const filtered = items.filter((item) => item.id !== itemId);

  if (filtered.length === items.length) return false;

  allItems[collectionId] = filtered;
  await writeItems(allItems);

  return true;
}

// Sync with client storage (for initial data)
export async function syncFromClient(
  collections: Collection[],
  items: Record<string, CollectionItem[]>
): Promise<void> {
  await writeCollections(collections);
  await writeItems(items);
}

// Helper to filter data fields based on selectFields config
function filterDataFields(
  data: Record<string, unknown>,
  selectFields?: string[]
): Record<string, unknown> {
  // If no selectFields specified, return all data
  if (!selectFields || selectFields.length === 0) {
    return data;
  }
  
  // Only include specified fields
  const filtered: Record<string, unknown> = {};
  for (const fieldName of selectFields) {
    if (fieldName in data) {
      filtered[fieldName] = data[fieldName];
    }
  }
  return filtered;
}

// Populate relation fields in an item
export async function populateItem(
  item: CollectionItem,
  collection: Collection,
  fieldsToPopulate: string[]
): Promise<CollectionItem> {
  if (fieldsToPopulate.length === 0) return item;

  const allItems = await readItems();
  const collections = await readCollections();
  const populatedData = { ...item.data };

  for (const fieldName of fieldsToPopulate) {
    const field = collection.fields.find((f) => f.name === fieldName);
    if (!field || !field.relation?.collectionId) continue;

    const relatedCollectionId = field.relation.collectionId;
    const relatedCollection = collections.find((c) => c.id === relatedCollectionId);
    const relatedItems = allItems[relatedCollectionId] || [];
    const selectFields = field.relation.selectFields;

    if (field.type === 'relation') {
      // Single relation - populate one item
      const relatedItemId = item.data[fieldName] as string;
      if (relatedItemId) {
        const relatedItem = relatedItems.find((ri) => ri.id === relatedItemId);
        if (relatedItem) {
          populatedData[fieldName] = {
            _id: relatedItem.id,
            _collection: relatedCollection?.name || 'Unknown',
            ...filterDataFields(relatedItem.data, selectFields),
          };
        }
      }
    } else if (field.type === 'relation_many') {
      // Multi relation - populate array of items
      const relatedItemIds = item.data[fieldName] as string[];
      if (Array.isArray(relatedItemIds)) {
        populatedData[fieldName] = relatedItemIds
          .map((id) => {
            const relatedItem = relatedItems.find((ri) => ri.id === id);
            if (relatedItem) {
              return {
                _id: relatedItem.id,
                _collection: relatedCollection?.name || 'Unknown',
                ...filterDataFields(relatedItem.data, selectFields),
              };
            }
            return null;
          })
          .filter(Boolean);
      }
    }
  }

  return {
    ...item,
    data: populatedData,
  };
}

// Populate relation fields in multiple items
export async function populateItems(
  items: CollectionItem[],
  collection: Collection,
  fieldsToPopulate: string[]
): Promise<CollectionItem[]> {
  if (fieldsToPopulate.length === 0) return items;
  
  return Promise.all(
    items.map((item) => populateItem(item, collection, fieldsToPopulate))
  );
}

