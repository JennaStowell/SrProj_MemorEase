import { NextResponse } from "next/server";
import { db } from "@/lib/db"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    let { setId, userId, term, definition, order } = body;

    setId = parseInt(setId, 10);
    if (isNaN(setId)) {
      console.error("Invalid setId:", setId);
      return NextResponse.json({ error: "Invalid setId" }, { status: 400 });
    }

    // Create the new term in the database
    const newTerm = await db.terms.create({
      data: { user_id: userId, term, definition },
    });

    console.log("New Term Created:", newTerm);

    // Create new SetContent to link the term to the set
    const newSetContent = await db.setContent.create({
      data: { set_id: setId, term_id: newTerm.term_id, order },
    });

    console.log("New Set Content Created:", newSetContent);

    // Include the term_id in the response
    return NextResponse.json({ ...newTerm, term_id: newTerm.term_id }, { status: 201 });
  } catch (error) {
    console.error("Error adding term:", error);
    return NextResponse.json({ error: "Error adding term" }, { status: 500 });
  }
}
