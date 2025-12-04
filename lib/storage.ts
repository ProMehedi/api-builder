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

