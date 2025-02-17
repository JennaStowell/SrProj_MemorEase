import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function ensureTableExists() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS terms (
        term_id SERIAL PRIMARY KEY,
        term TEXT NOT NULL,
        definition TEXT NOT NULL
      );
    `);
  }
  

  export async function GET(req: NextRequest) {
    try {
      // Ensure the table exists before querying
      await ensureTableExists();
  
      // Retrieve all terms and definitions
      const result = await pool.query('SELECT term, definition FROM terms');
  
      // Return the data as JSON
      return NextResponse.json(result.rows);
    } catch (error) {
      console.error('Error fetching terms:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  export async function POST(req: NextRequest) {
    try {
      await ensureTableExists(); // Ensure table exists before inserting
      const body = await req.json();
      if (!body.term || !body.definition) {
        return NextResponse.json({ error: 'Term and definition is required' }, { status: 400 });
      }
      await pool.query('INSERT INTO terms (term, definition) VALUES ($1, $2)', [body.term, body.definition]);
      return NextResponse.json({ message: 'Term added' });
    } catch (error) {
      console.error('Error inserting term:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  
  
  