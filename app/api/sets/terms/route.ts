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

    if (!userId) {
      console.error("Missing userId");
      return NextResponse.json({ error: "Missing userId" }, { status: 401 });
    }

    if (!term || !definition) {
      console.error("Missing term or definition");
      return NextResponse.json({ error: "Missing term or definition" }, { status: 400 });
    }

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

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { setId, order, term, definition } = body;

    const setIdNum = parseInt(setId, 10);
    if (isNaN(setIdNum)) {
      return NextResponse.json({ error: "Invalid setId" }, { status: 400 });
    }

    // Get term_id from setContent
    const setContent = await db.setContent.findFirst({
      where: { set_id: setIdNum, order },
    });

    if (!setContent) {
      return NextResponse.json({ error: "SetContent not found" }, { status: 404 });
    }

    // Update the term
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



// Inside your DELETE handler in `app/api/sets/terms/route.ts`
export async function DELETE(req: Request) {
  const { setId, termId } = await req.json(); // Destructure to get setId and termId

  if (!termId) {
    return new Response("Argument 'term_id' is missing.", { status: 400 });
  }

  try {
    // Perform the delete operation using termId
    await db.terms.delete({
      where: {
        term_id: termId,  // Make sure to use termId here for deletion
      },
    });

    // Optionally, delete any related setContent or other references if needed
    await db.setContent.deleteMany({
      where: { term_id: termId }, // Ensure related setContent entries are deleted as well
    });

    return new Response("Term deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting term:", error);
    return new Response("Error deleting term", { status: 500 });
  }
}
