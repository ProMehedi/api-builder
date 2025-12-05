import { NextRequest, NextResponse } from "next/server";
import {
  getCollectionBySlug,
  getItems,
  createItem,
  populateItems,
} from "@/lib/storage";
import { getDefaultRouteSettings } from "@/lib/types";

interface RouteContext {
  params: Promise<{ collection: string }>;
}

// Helper to get fields to populate from query params and route settings
function getFieldsToPopulate(
  request: NextRequest,
  routeSettings: ReturnType<typeof getDefaultRouteSettings>,
  method: 'GET_ALL' | 'GET_ONE'
): string[] {
  // Check query parameter first (overrides settings)
  const populateParam = request.nextUrl.searchParams.get('populate');
  if (populateParam) {
    return populateParam.split(',').map((f) => f.trim()).filter(Boolean);
  }
  
  // Fall back to route settings
  return routeSettings[method]?.populateFields || [];
}

// GET /api/[collection] - List all items
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { collection: slug } = await context.params;
    const collection = await getCollectionBySlug(slug);

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    let items = await getItems(collection.id);
    
    // Get fields to populate
    const routeSettings = collection.routeSettings || getDefaultRouteSettings();
    const fieldsToPopulate = getFieldsToPopulate(request, routeSettings, 'GET_ALL');
    
    // Populate relation fields if requested
    if (fieldsToPopulate.length > 0) {
      items = await populateItems(items, collection, fieldsToPopulate);
    }

    return NextResponse.json({
      success: true,
      data: items,
      meta: {
        total: items.length,
        collection: collection.name,
        populated: fieldsToPopulate.length > 0 ? fieldsToPopulate : undefined,
      },
    });
  } catch (error) {
    console.error("GET items error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// POST /api/[collection] - Create a new item
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { collection: slug } = await context.params;
    const collection = await getCollectionBySlug(slug);

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found", code: "NOT_FOUND" },
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

    const item = await createItem(collection.id, data);

    return NextResponse.json(
      {
        success: true,
        data: item,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST item error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

