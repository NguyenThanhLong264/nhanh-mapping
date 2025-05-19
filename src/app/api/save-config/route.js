import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  const newArray = await request.json(); // Nhận trực tiếp một array
  const configPath = path.join(process.cwd(), 'src', 'app', 'data', 'config.json');

  try {
    // Ghi mảng trực tiếp vào file
    await fs.writeFile(configPath, JSON.stringify(newArray, null, 2));
    return NextResponse.json({ message: 'Array saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Save array error:', error);
    return NextResponse.json({ error: 'Failed to save array' }, { status: 500 });
  }
}

export async function GET() {
  const configPath = path.join(process.cwd(), 'src', 'app', 'data', 'config.json');
  try {
    const data = await fs.readFile(configPath, 'utf8');
    const parsed = JSON.parse(data);
    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.log('Get array - No config found, returning empty array');
    return NextResponse.json([], { status: 200 });
  }
}
