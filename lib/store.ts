"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Collection, CollectionItem, Field } from "./types";
import { generateId, generateSlug } from "./types";

interface ApiBuilderStore {
  // Collections
  collections: Collection[];
  addCollection: (
    name: string,
    fields: Omit<Field, "id">[],
    description?: string
  ) => Collection;
  updateCollection: (
    id: string,
    updates: Partial<Omit<Collection, "id" | "createdAt">>
  ) => void;
  deleteCollection: (id: string) => void;
  getCollection: (id: string) => Collection | undefined;
  getCollectionBySlug: (slug: string) => Collection | undefined;

  // Collection Items
  items: Record<string, CollectionItem[]>;
  addItem: (collectionId: string, data: Record<string, unknown>) => CollectionItem;
  updateItem: (
    collectionId: string,
    itemId: string,
    data: Record<string, unknown>
  ) => void;
  deleteItem: (collectionId: string, itemId: string) => void;
  getItems: (collectionId: string) => CollectionItem[];
  getItem: (collectionId: string, itemId: string) => CollectionItem | undefined;
}

export const useApiBuilderStore = create<ApiBuilderStore>()(
  persist(
    (set, get) => ({
      collections: [],
      items: {},

      addCollection: (name, fields, description) => {
        const now = new Date().toISOString();
        const collection: Collection = {
          id: generateId(),
          name,
          slug: generateSlug(name),
          description,
          fields: fields.map((f) => ({ ...f, id: generateId() })),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          collections: [...state.collections, collection],
          items: { ...state.items, [collection.id]: [] },
        }));

        return collection;
      },

      updateCollection: (id, updates) => {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...updates,
                  slug: updates.name ? generateSlug(updates.name) : c.slug,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }));
      },

      deleteCollection: (id) => {
        set((state) => {
          const newItems = { ...state.items };
          delete newItems[id];
          return {
            collections: state.collections.filter((c) => c.id !== id),
            items: newItems,
          };
        });
      },

      getCollection: (id) => {
        return get().collections.find((c) => c.id === id);
      },

      getCollectionBySlug: (slug) => {
        return get().collections.find((c) => c.slug === slug);
      },

      addItem: (collectionId, data) => {
        const now = new Date().toISOString();
        const item: CollectionItem = {
          id: generateId(),
          collectionId,
          data,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          items: {
            ...state.items,
            [collectionId]: [...(state.items[collectionId] || []), item],
          },
        }));

        return item;
      },

      updateItem: (collectionId, itemId, data) => {
        set((state) => ({
          items: {
            ...state.items,
            [collectionId]: (state.items[collectionId] || []).map((item) =>
              item.id === itemId
                ? { ...item, data, updatedAt: new Date().toISOString() }
                : item
            ),
          },
        }));
      },

      deleteItem: (collectionId, itemId) => {
        set((state) => ({
          items: {
            ...state.items,
            [collectionId]: (state.items[collectionId] || []).filter(
              (item) => item.id !== itemId
            ),
          },
        }));
      },

      getItems: (collectionId) => {
        return get().items[collectionId] || [];
      },

      getItem: (collectionId, itemId) => {
        return (get().items[collectionId] || []).find(
          (item) => item.id === itemId
        );
      },
    }),
    {
      name: "api-builder-storage",
    }
  )
);

