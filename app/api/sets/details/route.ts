import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const setId = searchParams.get("setId");

    if (!setId || typeof setId !== "string") {
      return NextResponse.json({ error: "Invalid setId" }, { status: 400 });
    }

    
    const set = await db.sets.findUnique({
      where: { set_id: setId },
      select: { set_name: true },
    });

    if (!set) {
      return NextResponse.json({ error: `Set with ID ${setId} not found` }, { status: 404 });
    }

    
    const termLinks = await db.setContent.findMany({
      where: { set_id: setId },
      select: { term_id: true },
    });

    const termIds = termLinks.map((sc: { term_id: number }) => sc.term_id);

    const terms = await db.terms.findMany({
      where: {
        term_id: {
          in: termIds,
        },
      },
    });

    return NextResponse.json({ setName: set.set_name, terms }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching set details:", error.message || error);
    return NextResponse.json({ error: error.message || "Error fetching set details" }, { status: 500 });
  }
}
