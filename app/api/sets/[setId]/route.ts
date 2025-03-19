// import { db } from "@/lib/db";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { setId: string } }
// ) {
//   try {
//     const { setId } = params;

//     if (!setId) {
//       return NextResponse.json({ error: "Set ID is required" }, { status: 400 });
//     }

    import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { setId: string } }
) {
  try {
    const { setId } = await params;

    if (!setId) {
      return NextResponse.json({ error: "Set ID is required" }, { status: 400 });
    }

    const setIdNum = Number(setId);

    // Check if setId is a valid number
    if (isNaN(setIdNum)) {
      return NextResponse.json({ error: "Invalid Set ID" }, { status: 400 });
    }

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
    console.error("Error fetching set details:", error);
    return NextResponse.json({ error: error.message || "Error fetching set details" }, { status: 500 });
  }
}

// import { db } from "@/lib/db";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { setId: string } }
// ) {
//   try {
//     const { setId } = params;

//     if (!setId) {
//       return NextResponse.json({ error: "Set ID is required" }, { status: 400 });
//     }

//     const setIdNum = Number(setId);

//     // Check if setId is a valid number
//     if (isNaN(setIdNum)) {
//       return NextResponse.json({ error: "Invalid Set ID" }, { status: 400 });
//     }

//     const set = await db.sets.findUnique({
//       where: { set_id: setIdNum },
//     });

//     if (!set) {
//       return NextResponse.json({ error: "Set not found" }, { status: 404 });
//     }

//     const terms = await db.terms.findMany({
//       where: {
//         term_id: {
//           in: (
//             await db.setContent.findMany({
//               where: { set_id: setIdNum },
//               select: { term_id: true },
//             })
//           ).map((sc) => sc.term_id),
//         },
//       },
//     });

//     return NextResponse.json({ set, terms }, { status: 200 });
//   } catch (error: any) {
//     console.error("Error fetching set details:", error);
//     return NextResponse.json({ error: error.message || "Error fetching set details" }, { status: 500 });
//   }
// }
