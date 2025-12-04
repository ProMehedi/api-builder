import { NextRequest, NextResponse } from "next/server";
import {
  syncFromClient,
  getAllCollections,
  readItems,
} from "@/lib/storage";
import type { Collection, CollectionItem } from "@/lib/types";

// POST /api/sync - Sync data from client to server
export async function POST(request: NextRequest) {
  try {
    const { collections, items } = (await request.json()) as {
      collections: Collection[];
      items: Record<string, CollectionItem[]>;
    };

    await syncFromClient(collections, items);

    return NextResponse.json({
      success: true,
      message: "Data synced successfully",
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync data", code: "SYNC_ERROR" },
      { status: 500 }
    );
  }
}

// GET /api/sync - Get data from server
export async function GET() {
  try {
    const collections = await getAllCollections();
    const items = await readItems();

    return NextResponse.json({
      success: true,
      data: {
        collections,
        items,
      },
    });
  } catch (error) {
    console.error("Get sync data error:", error);
    return NextResponse.json(
      { error: "Failed to get data", code: "FETCH_ERROR" },
      { status: 500 }
    );
  }
}

