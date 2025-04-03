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

    // Validate setId
    const setIdNum = parseInt(setId, 10);
    if (isNaN(setIdNum)) {
      return NextResponse.json({ error: "Invalid setId" }, { status: 400 });
    }

    // Insert terms into `terms` table and get their IDs
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

    // Insert into `set_content` table
    await db.setContent.createMany({
      data: createdTerms.map((t, index) => ({
        set_id: setIdNum,
        term_id: t.term_id,
        order: index + 1, // Maintain order from CSV
      })),
    });

    return NextResponse.json({ message: "Bulk terms added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error adding terms:", error);
    return NextResponse.json({ error: "Error adding terms" }, { status: 500 });
  }
}
