"use client"

import { useState, useEffect } from "react"
import {
  Type,
  AlignLeft,
  Hash,
  ToggleLeft,
  Mail,
  Link,
  Calendar,
  Clock,
  List,
  Braces,
} from "lucide-react"
import { toast } from "sonner"

import type { Collection, FieldType, CollectionItem } from "@/lib/types"
import { useApiBuilderStore } from "@/lib/store"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const FIELD_ICONS: Record<FieldType, React.ReactNode> = {
  string: <Type className="size-4" />,
  text: <AlignLeft className="size-4" />,
  number: <Hash className="size-4" />,
  boolean: <ToggleLeft className="size-4" />,
  email: <Mail className="size-4" />,
  url: <Link className="size-4" />,
  date: <Calendar className="size-4" />,
  datetime: <Clock className="size-4" />,
  select: <List className="size-4" />,
  json: <Braces className="size-4" />,
};

interface ItemFormDialogProps {
  collection: Collection;
  item?: CollectionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemFormDialog({
  collection,
  item,
  open,
  onOpenChange,
}: ItemFormDialogProps) {
  const { addItem, updateItem } = useApiBuilderStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const isEditing = !!item;

  useEffect(() => {
    if (item) {
      setFormData(item.data);
    } else {
      // Initialize with default values
      const defaults: Record<string, unknown> = {};
      collection.fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          defaults[field.name] = field.defaultValue;
        } else if (field.type === "boolean") {
          defaults[field.name] = false;
        } else if (field.type === "number") {
          defaults[field.name] = "";
        } else {
          defaults[field.name] = "";
        }
      });
      setFormData(defaults);
    }
  }, [item, collection.fields, open]);

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const missingFields = collection.fields.filter(
      (f) =>
        f.required &&
        (formData[f.name] === undefined ||
          formData[f.name] === "" ||
          formData[f.name] === null)
    );

    if (missingFields.length > 0) {
      toast.error(
        `Required fields missing: ${missingFields.map((f) => f.name).join(", ")}`
      );
      return;
    }

    // Process form data - convert types
    const processedData: Record<string, unknown> = {};
    collection.fields.forEach((field) => {
      let value = formData[field.name];

      if (field.type === "number" && typeof value === "string") {
        value = value === "" ? null : Number(value);
      } else if (field.type === "json" && typeof value === "string") {
        try {
          value = value === "" ? null : JSON.parse(value);
        } catch {
          toast.error(`Invalid JSON for field "${field.name}"`);
          return;
        }
      }

      processedData[field.name] = value;
    });

    if (isEditing && item) {
      updateItem(collection.id, item.id, processedData);
      toast.success("Item updated successfully");
    } else {
      addItem(collection.id, processedData);
      toast.success("Item created successfully");
    }

    onOpenChange(false);
  };

  const renderField = (field: (typeof collection.fields)[0]) => {
    const value = formData[field.name];
    const commonProps = {
      id: `field-${field.name}`,
      required: field.required,
    };

    switch (field.type) {
      case "text":
      case "json":
        return (
          <Textarea
            {...commonProps}
            value={(value as string) || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={
              field.type === "json" ? '{"key": "value"}' : "Enter text..."
            }
            rows={field.type === "json" ? 4 : 3}
            className={field.type === "json" ? "font-mono text-sm" : ""}
          />
        );

      case "number":
        return (
          <Input
            {...commonProps}
            type="number"
            value={(value as string | number) ?? ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder="0"
            step="any"
          />
        );

      case "boolean":
        return (
          <div className="flex items-center gap-2 h-9">
            <Switch
              {...commonProps}
              checked={!!value}
              onCheckedChange={(checked) =>
                handleFieldChange(field.name, checked)
              }
            />
            <span className="text-sm text-muted-foreground">
              {value ? "True" : "False"}
            </span>
          </div>
        );

      case "email":
        return (
          <Input
            {...commonProps}
            type="email"
            value={(value as string) || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder="email@example.com"
          />
        );

      case "url":
        return (
          <Input
            {...commonProps}
            type="url"
            value={(value as string) || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder="https://example.com"
          />
        );

      case "date":
        return (
          <Input
            {...commonProps}
            type="date"
            value={(value as string) || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );

      case "datetime":
        return (
          <Input
            {...commonProps}
            type="datetime-local"
            value={(value as string) || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );

      case "select":
        return (
          <Select
            value={(value as string) || ""}
            onValueChange={(v) => handleFieldChange(field.name, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "string":
      default:
        return (
          <Input
            {...commonProps}
            type="text"
            value={(value as string) || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder="Enter value..."
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>
            {isEditing ? "Edit Item" : "Create New Item"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update the item in "${collection.name}"`
              : `Add a new item to "${collection.name}"`}
          </DialogDescription>
        </DialogHeader>

        <form
          id="item-form"
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-5 pb-4">
              {collection.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {FIELD_ICONS[field.type]}
                    </span>
                    <Label htmlFor={`field-${field.name}`} className="flex-1">
                      {field.name}
                    </Label>
                    {field.required && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  {renderField(field)}
                  {field.description && (
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-muted/30 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Save Changes" : "Create Item"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

