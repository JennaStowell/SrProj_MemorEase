import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const setId = searchParams.get("setId");

    if (!setId) {
      return NextResponse.json({ error: "Missing setId" }, { status: 400 });
    }

    const setIdNum = Number(setId);
    if (isNaN(setIdNum)) {
      return NextResponse.json({ error: "Invalid setId" }, { status: 400 });
    }

    // Fetch the set details from the sets table
    const set = await db.sets.findUnique({
      where: { set_id: setIdNum },
    });

    if (!set) {
      return NextResponse.json({ error: `Set with ID ${setIdNum} not found` }, { status: 404 });
    }

    // Fetch terms related to this set from the setContent and terms tables
    const terms = await db.terms.findMany({
      where: {
        term_id: {
          in: (
            await db.setContent.findMany({
              where: { set_id: setIdNum },
              select: { term_id: true },
            })
          ).map((sc) => sc.term_id),
        },
      },
    });

    return NextResponse.json({ set, terms }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching set details:", error.message || error);
    return NextResponse.json({ error: error.message || "Error fetching set details" }, { status: 500 });
  }
}
