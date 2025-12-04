"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Database,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

import type { Collection } from "@/lib/types";
import { useApiBuilderStore } from "@/lib/store";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const { deleteCollection, getItems } = useApiBuilderStore();
  const items = getItems(collection.id);
  const apiEndpoint = `/api/${collection.slug}`;

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(window.location.origin + apiEndpoint);
    toast.success("API endpoint copied to clipboard");
  };

  const handleDelete = () => {
    deleteCollection(collection.id);
    toast.success(`Collection "${collection.name}" deleted`);
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Database className="size-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-base">
                {collection.name}
              </CardTitle>
              <p className="truncate text-xs text-muted-foreground font-mono">
                {apiEndpoint}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/collections/${collection.id}`}>
                  <ExternalLink className="size-4" />
                  Open Collection
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyEndpoint}>
                <Copy className="size-4" />
                Copy API Endpoint
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/collections/${collection.id}/edit`}>
                  <Pencil className="size-4" />
                  Edit Schema
                </Link>
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Delete Collection
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &quot;{collection.name}&quot;
                      and all {items.length} items. This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {collection.description && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {collection.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="secondary" className="text-xs font-normal">
            {collection.fields.length} field
            {collection.fields.length !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="outline" className="text-xs font-normal">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Updated{" "}
            {formatDistanceToNow(new Date(collection.updatedAt), {
              addSuffix: true,
            })}
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/collections/${collection.id}`}>View Data</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

