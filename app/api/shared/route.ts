// app/api/shared/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // adjust path to your db client

export async function GET() {
  const sharedLinks = await db.shared.findMany({
    orderBy: { inserted_at: 'desc' },
  });
  return NextResponse.json(sharedLinks);
}

export async function POST(req: NextRequest) {
  const { shared_name, link } = await req.json();

  if (!shared_name || !link) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const newEntry = await db.shared.create({
    data: {
      shared_name,
      link,
    },
  });

    return NextResponse.json(newEntry, { status: 201 });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  try {
    await db.shared.delete({
      where: { shared_id: id },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response('Failed to delete entry', { status: 500 });
  }
}
