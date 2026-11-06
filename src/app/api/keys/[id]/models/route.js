import { NextResponse } from "next/server";
import { getApiKeyById, getKeyModels, setKeyModels } from "@/lib/localDb";
import { sanitizeAllowlist } from "@/sse/services/keyModelAllowlist.js";

// GET /api/keys/[id]/models - { models: string[] } (empty = unrestricted)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!(await getApiKeyById(id))) return NextResponse.json({ error: "Key not found" }, { status: 404 });
    return NextResponse.json({ models: await getKeyModels(id) });
  } catch (error) {
    console.log("Error fetching key models:", error);
    return NextResponse.json({ error: "Failed to fetch key models" }, { status: 500 });
  }
}

// PUT /api/keys/[id]/models - body { models: string[] }; [] removes the restriction
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!(await getApiKeyById(id))) return NextResponse.json({ error: "Key not found" }, { status: 404 });

    const body = await request.json().catch(() => null);
    const { models, error } = sanitizeAllowlist(body?.models);
    if (error) return NextResponse.json({ error }, { status: 400 });

    return NextResponse.json({ models: await setKeyModels(id, models) });
  } catch (error) {
    console.log("Error updating key models:", error);
    return NextResponse.json({ error: "Failed to update key models" }, { status: 500 });
  }
}
