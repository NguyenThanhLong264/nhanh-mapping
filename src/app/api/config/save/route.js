import { saveCondition } from '@/app/lib/db';
import { saveConfig } from '@/app/lib/handlers/readJSON';

export async function POST(request) {
    const newArray = await request.json();
    try {
        if (process.env.DB_TYPE === 'mysql') {
            const name = "config"
            await saveCondition(name, JSON.stringify(newArray));
        } else if (process.env.DB_TYPE === 'sqlite') {
            await saveConfig(newArray)
            return Response.json({ message: 'Array saved successfully' }, { status: 200 });
        } else {
            return Response.json({ message: 'Undefined DB Type' }, { status: 400 });
        }
        return Response.json({ message: 'Array saved successfully' }, { status: 200 });
    } catch (error) {
        console.error('Save array error:', error);
        return Response.json({ error: 'Failed to save array' }, { status: 500 });
    }
}