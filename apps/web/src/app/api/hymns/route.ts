import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const hymnsPath = path.join(process.cwd(), 'src/app/content/hymns.json');

export async function GET() {
  try {
    const jsonData = await fs.readFile(hymnsPath, 'utf8');
    const data = JSON.parse(jsonData);
    return NextResponse.json({ success: true, data: data.hymns });
  } catch (error) {
    console.error('Error reading hymns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read hymns' }, 
      { status: 500 }
    );
  }
} 