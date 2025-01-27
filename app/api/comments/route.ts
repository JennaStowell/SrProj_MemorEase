import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET(req: NextRequest) {
  try {
    const result = await pool.query('SELECT comment FROM comments');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { comment } = body;
//     if (!comment) {
//       return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
//     }
//     await pool.query('INSERT INTO comments (comment) VALUES ($1)', [comment]);
//     return NextResponse.json({ message: 'Comment added' });
//   } catch (error) {
//     console.error('Error inserting comment:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }

  async function ensureTableExists() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        comment TEXT NOT NULL
      );
    `);
  }
  
  export async function POST(req: NextRequest) {
    try {
      await ensureTableExists(); // Ensure table exists before inserting
      const body = await req.json();
      if (!body.comment) {
        return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
      }
      await pool.query('INSERT INTO comments (comment) VALUES ($1)', [body.comment]);
      return NextResponse.json({ message: 'Comment added' });
    } catch (error) {
      console.error('Error inserting comment:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

