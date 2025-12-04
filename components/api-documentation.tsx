"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

import type { Collection } from "@/lib/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ApiDocumentationProps {
  collection: Collection;
}

export function ApiDocumentation({ collection }: ApiDocumentationProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://your-domain.com";
  const endpoint = `/api/${collection.slug}`;
  const fullUrl = `${baseUrl}${endpoint}`;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const endpoints = [
    {
      method: "GET",
      path: endpoint,
      description: "List all items",
      color: "bg-green-500/10 text-green-700 dark:text-green-400",
    },
    {
      method: "POST",
      path: endpoint,
      description: "Create a new item",
      color: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    },
    {
      method: "GET",
      path: `${endpoint}/:id`,
      description: "Get a single item by ID",
      color: "bg-green-500/10 text-green-700 dark:text-green-400",
    },
    {
      method: "PUT",
      path: `${endpoint}/:id`,
      description: "Update an item by ID",
      color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    },
    {
      method: "DELETE",
      path: `${endpoint}/:id`,
      description: "Delete an item by ID",
      color: "bg-red-500/10 text-red-700 dark:text-red-400",
    },
  ];

  const samplePayload = collection.fields.reduce(
    (acc, field) => {
      switch (field.type) {
        case "string":
          acc[field.name] = "example text";
          break;
        case "text":
          acc[field.name] = "Lorem ipsum dolor sit amet...";
          break;
        case "number":
          acc[field.name] = 42;
          break;
        case "boolean":
          acc[field.name] = true;
          break;
        case "email":
          acc[field.name] = "user@example.com";
          break;
        case "url":
          acc[field.name] = "https://example.com";
          break;
        case "date":
          acc[field.name] = "2024-01-15";
          break;
        case "datetime":
          acc[field.name] = "2024-01-15T10:30:00Z";
          break;
        case "select":
          acc[field.name] = field.options?.[0] || "option1";
          break;
        case "json":
          acc[field.name] = { key: "value" };
          break;
        default:
          acc[field.name] = "value";
      }
      return acc;
    },
    {} as Record<string, unknown>
  );

  const curlExamples = {
    list: `curl ${fullUrl}`,
    create: `curl -X POST ${fullUrl} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(samplePayload, null, 2)}'`,
    get: `curl ${fullUrl}/<item_id>`,
    update: `curl -X PUT ${fullUrl}/<item_id> \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(samplePayload, null, 2)}'`,
    delete: `curl -X DELETE ${fullUrl}/<item_id>`,
  };

  const jsExamples = {
    list: `// List all items
const response = await fetch('${fullUrl}');
const items = await response.json();
console.log(items);`,
    create: `// Create a new item
const response = await fetch('${fullUrl}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${JSON.stringify(samplePayload, null, 2)})
});
const newItem = await response.json();
console.log(newItem);`,
    get: `// Get a single item
const response = await fetch('${fullUrl}/<item_id>');
const item = await response.json();
console.log(item);`,
    update: `// Update an item
const response = await fetch('${fullUrl}/<item_id>', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${JSON.stringify(samplePayload, null, 2)})
});
const updatedItem = await response.json();
console.log(updatedItem);`,
    delete: `// Delete an item
const response = await fetch('${fullUrl}/<item_id>', {
  method: 'DELETE'
});
console.log('Item deleted');`,
  };

  return (
    <div className="space-y-6">
      {/* Endpoints Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {endpoints.map((ep, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    className={`font-mono text-xs ${ep.color} border-0`}
                    variant="secondary"
                  >
                    {ep.method}
                  </Badge>
                  <code className="text-sm font-mono">{ep.path}</code>
                </div>
                <span className="text-sm text-muted-foreground">
                  {ep.description}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Code Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="js" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="js">JavaScript</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>

            <TabsContent value="js" className="space-y-4">
              {Object.entries(jsExamples).map(([key, code]) => (
                <div key={key} className="relative">
                  <div className="absolute right-2 top-2 z-10">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleCopy(code, `js-${key}`)}
                    >
                      {copiedCode === `js-${key}` ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100">
                    <code>{code}</code>
                  </pre>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="curl" className="space-y-4">
              {Object.entries(curlExamples).map(([key, code]) => (
                <div key={key} className="relative">
                  <div className="absolute right-2 top-2 z-10">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleCopy(code, `curl-${key}`)}
                      className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                      {copiedCode === `curl-${key}` ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100">
                    <code>{code}</code>
                  </pre>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Schema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Response Schema</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100">
            <code>
              {JSON.stringify(
                {
                  id: "unique-item-id",
                  collectionId: collection.id,
                  data: samplePayload,
                  createdAt: "2024-01-15T10:30:00.000Z",
                  updatedAt: "2024-01-15T10:30:00.000Z",
                },
                null,
                2
              )}
            </code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

