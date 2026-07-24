import { NextResponse } from "next/server";
import { getDataSource } from "@/data/datasource";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const detail = await getDataSource().getTeamDetail(id.toUpperCase());
    if (!detail) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }
    return NextResponse.json(detail, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Data source error" },
      { status: 502 }
    );
  }
}
