import { NextRequest, NextResponse } from "next/server";
import {
  getCollectionBySlug,
  getItem,
  updateItem,
  deleteItem,
} from "@/lib/storage";

interface RouteContext {
  params: Promise<{ collection: string; itemId: string }>;
}

// GET /api/[collection]/[itemId] - Get a single item
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { collection: slug, itemId } = await context.params;
    const collection = await getCollectionBySlug(slug);

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const item = await getItem(collection.id, itemId);

    if (!item) {
      return NextResponse.json(
        { error: "Item not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("GET item error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// PUT /api/[collection]/[itemId] - Update an item
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { collection: slug, itemId } = await context.params;
    const collection = await getCollectionBySlug(slug);

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const existingItem = await getItem(collection.id, itemId);

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const missingFields: string[] = [];
    collection.fields.forEach((field) => {
      if (
        field.required &&
        (body[field.name] === undefined ||
          body[field.name] === null ||
          body[field.name] === "")
      ) {
        missingFields.push(field.name);
      }
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          code: "VALIDATION_ERROR",
          fields: missingFields,
        },
        { status: 400 }
      );
    }

    // Filter to only include defined fields
    const data: Record<string, unknown> = {};
    collection.fields.forEach((field) => {
      if (body[field.name] !== undefined) {
        data[field.name] = body[field.name];
      }
    });

    const updatedItem = await updateItem(collection.id, itemId, data);

    return NextResponse.json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error("PUT item error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// DELETE /api/[collection]/[itemId] - Delete an item
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { collection: slug, itemId } = await context.params;
    const collection = await getCollectionBySlug(slug);

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const deleted = await deleteItem(collection.id, itemId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Item not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("DELETE item error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

