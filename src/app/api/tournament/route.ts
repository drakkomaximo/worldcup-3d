import { NextResponse } from "next/server";
import { getDataSource } from "@/data/datasource";

export async function GET() {
  try {
    const tournament = await getDataSource().getTournament();
    return NextResponse.json(tournament, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Data source error" },
      { status: 502 }
    );
  }
}
