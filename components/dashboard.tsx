"use client";

import { useState, useEffect } from "react";
import { Database, Plus, Search, Zap, Code2, Layers } from "lucide-react";

import { useApiBuilderStore } from "@/lib/store";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { CollectionCard } from "@/components/collection-card";
import { CreateCollectionDialog } from "@/components/create-collection-dialog";

export function Dashboard() {
  const { collections } = useApiBuilderStore();
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredCollections = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  // Show loading skeleton while hydrating
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="mt-2 h-4 w-64 rounded bg-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl border bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      {/* Hero Section */}
      {collections.length === 0 ? (
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
            <Zap className="size-10 text-white" />
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Build APIs in Minutes
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Create collections and get auto-generated REST APIs instantly. No
            backend coding required.
          </p>

          {/* Feature highlights */}
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code2 className="size-4 text-violet-500" />
              Auto REST APIs
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="size-4 text-violet-500" />
              Schema Builder
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="size-4 text-violet-500" />
              Instant CRUD
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Collections
            </h1>
            <p className="text-muted-foreground">
              Manage your API collections and schemas
            </p>
          </div>
          <CreateCollectionDialog />
        </div>
      )}

      {/* Search and Filter */}
      {collections.length > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <Empty className="border-2 min-h-[300px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Database className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No collections yet</EmptyTitle>
            <EmptyDescription>
              Create your first collection to start building your API. Each
              collection becomes a full REST API endpoint.
            </EmptyDescription>
          </EmptyHeader>
          <CreateCollectionDialog>
            <Button size="lg">
              <Plus className="size-4" />
              Create First Collection
            </Button>
          </CreateCollectionDialog>
        </Empty>
      ) : filteredCollections.length === 0 ? (
        <Empty className="border min-h-[200px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No results found</EmptyTitle>
            <EmptyDescription>
              No collections match &quot;{search}&quot;. Try a different search
              term.
            </EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={() => setSearch("")}>
            Clear Search
          </Button>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  );
}

