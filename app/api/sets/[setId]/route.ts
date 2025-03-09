import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest, { params }: { params: { setId: string } }) {
  const { setId } = params;

  if (!setId) {
    return NextResponse.json({ error: "Set ID is required" }, { status: 400 });
  }

  try {
    const set = await db.sets.findUnique({
      where: { set_id: Number(setId) },
    });

    if (!set) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

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
    return NextResponse.json({ error: error.message || "Error fetching set details" }, { status: 500 });
  }
}
