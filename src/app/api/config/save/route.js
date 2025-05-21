import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { saveCondition } from '@/app/lib/db';

export async function POST(request) {
    const newArray = await request.json();
    const configPath = path.join(process.cwd(), 'src', 'app', 'data', 'config.json');

    try {
        if (process.env.DB_TYPE === 'mysql') {
            // MySQL specific save logic
            const name = "config"
            await saveCondition(name, JSON.stringify(newArray));
        } else if (process.env.DB_TYPE === 'sqlite') {
            await fs.writeFile(configPath, JSON.stringify(newArray, null, 2));
            return NextResponse.json({ message: 'Array saved successfully' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Undefined DB Type' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Array saved successfully' }, { status: 200 });
    } catch (error) {
        console.error('Save array error:', error);
        return NextResponse.json({ error: 'Failed to save array' }, { status: 500 });
    }
}