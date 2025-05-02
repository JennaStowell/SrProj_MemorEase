import { NextAuthOptions } from 'next-auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Import authOptions

export async function GET() {
  const session = await getServerSession(authOptions);  // Use getServerSession here
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sharedLinks = await db.shared.findMany({
    where: { user_id: userId },
    orderBy: { inserted_at: 'desc' },
  });

  return NextResponse.json(sharedLinks);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);  // Use getServerSession here
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { shared_name, link } = await req.json();

  if (!shared_name || !link) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const newEntry = await db.shared.create({
    data: {
      shared_name,
      link,
      user_id: userId,
    },
  });

  return NextResponse.json(newEntry, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);  // Use getServerSession here
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();

  const entry = await db.shared.findUnique({
    where: { shared_id: id },
  });

  if (!entry || entry.user_id !== userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  await db.shared.delete({
    where: { shared_id: id },
  });

  return new Response(null, { status: 204 });
}
