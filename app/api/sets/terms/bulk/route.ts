import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface TermData {
  term: string;
  definition: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    const { setId, userId, terms }: { setId: string; userId: string; terms: TermData[] } = body;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(setId)) {
      return NextResponse.json({ error: "Invalid setId format" }, { status: 400 });
    }

    
    const createdTerms = await Promise.all(
      terms.map(async ({ term, definition }: TermData) => {
        return db.terms.create({
          data: {
            user_id: userId,
            term,
            definition,
          },
        });
      })
    );

    console.log("Terms Created:", createdTerms);

    
    await db.setContent.createMany({
      data: createdTerms.map((t, index) => ({
        set_id: setId, 
        term_id: t.term_id,
        order: index + 1,
      })),
    });

    return NextResponse.json({ message: "Bulk terms added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error adding terms:", error);
    return NextResponse.json({ error: "Error adding terms" }, { status: 500 });
  }
}
