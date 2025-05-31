import { db } from "@/server";
import { oppositions } from "@/server/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allOppositions = await db.select().from(oppositions);
    return NextResponse.json(allOppositions);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch oppositions" },
      { status: 500 }
    );
  }
}
