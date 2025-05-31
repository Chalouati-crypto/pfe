import { db } from "@/server";
import { articles } from "@/server/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allArticles = await db.select().from(articles);
    return NextResponse.json(allArticles);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
