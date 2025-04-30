import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST: Add a new term to a set
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    const { setId, userId, term, definition, order } = body;

    if (!setId || typeof setId !== "string") {
      return NextResponse.json({ error: "Invalid or missing setId" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 401 });
    }

    if (!term || !definition) {
      return NextResponse.json({ error: "Missing term or definition" }, { status: 400 });
    }

    const newTerm = await db.terms.create({
      data: { user_id: userId, term, definition },
    });

    const newSetContent = await db.setContent.create({
      data: { set_id: setId, term_id: newTerm.term_id, order },
    });

    return NextResponse.json({ ...newTerm, term_id: newTerm.term_id }, { status: 201 });
  } catch (error) {
    console.error("Error adding term:", error);
    return NextResponse.json({ error: "Error adding term" }, { status: 500 });
  }
}

// PUT: Update an existing term in a set
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { setId, order, term, definition } = body;

    if (!setId || typeof setId !== "string") {
      return NextResponse.json({ error: "Invalid or missing setId" }, { status: 400 });
    }

    const setContent = await db.setContent.findFirst({
      where: { set_id: setId, order },
    });

    if (!setContent) {
      return NextResponse.json({ error: "SetContent not found" }, { status: 404 });
    }

    const updatedTerm = await db.terms.update({
      where: { term_id: setContent.term_id },
      data: { term, definition },
    });

    return NextResponse.json(updatedTerm, { status: 200 });
  } catch (error) {
    console.error("Error updating term:", error);
    return NextResponse.json({ error: "Failed to update term" }, { status: 500 });
  }
}

// DELETE: Delete a term and related SetContent
export async function DELETE(req: Request) {
  try {
    const { setId, termId } = await req.json();

    if (!termId) {
      return new Response("Argument 'termId' is missing.", { status: 400 });
    }

    await db.setContent.deleteMany({
      where: { term_id: termId },
    });

    await db.terms.delete({
      where: { term_id: termId },
    });

    return new Response("Term deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting term:", error);
    return new Response("Error deleting term", { status: 500 });
  }
}
