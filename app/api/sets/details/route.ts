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

    // Fetch the set's name
    const set = await db.sets.findUnique({
      where: { set_id: setIdNum },
      select: { set_name: true },
    });

    if (!set) {
      return NextResponse.json({ error: `Set with ID ${setIdNum} not found` }, { status: 404 });
    }

    // Fetch related terms
    const terms = await db.terms.findMany({
      where: {
        term_id: {
          in: (
            await db.setContent.findMany({
              where: { set_id: setIdNum },
              select: { term_id: true },
            })
          ).map((sc: { term_id: number }) => sc.term_id), // Explicitly type `sc` as having `term_id`
        },
      },
    });

    return NextResponse.json({ setName: set.set_name, terms }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching set details:", error.message || error);
    return NextResponse.json({ error: error.message || "Error fetching set details" }, { status: 500 });
  }
}
