import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { setId: string } }) {
  try {
    const { setId } = params;

    if (!setId) {
      return NextResponse.json({ error: "Missing setId" }, { status: 400 });
    }

    // Fetch set details
    const set = await db.sets.findUnique({
      where: { set_id: Number(setId) },
    });

    if (!set) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    // Fetch associated terms
    const terms = await db.terms.findMany({
      where: {
        term_id: {
          in: (
            await db.setContent.findMany({
              where: { set_id: Number(setId) },
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
