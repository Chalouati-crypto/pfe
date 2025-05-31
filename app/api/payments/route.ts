import { db } from "@/server";
import { payments } from "@/server/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allPayments = await db.select().from(payments);
    return NextResponse.json(allPayments);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
