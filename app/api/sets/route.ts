import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    const { userId, setName } = body;

    if (!userId || !setName) {
      return NextResponse.json({ error: "Missing userId or setName" }, { status: 400 });
    }

    const newSet = await db.sets.create({
      data: { user_id: userId, set_name: setName },
    });

    if (!newSet) {
      throw new Error("Database insertion failed: newSet is null");
    }

    return NextResponse.json(newSet, { status: 201 });
  } catch (error: any) {
    console.error("Error creating set:", error.message || error);
    return NextResponse.json({ error: error.message || "Error creating set" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const sets = await db.sets.findMany({
      where: { user_id: userId },
    });

    return NextResponse.json(sets.length > 0 ? sets : [], { status: 200 });
  } catch (error: any) {
    console.error("Error fetching sets:", error.message || error);
    return NextResponse.json({ error: error.message || "Error fetching sets" }, { status: 500 });
  }
}