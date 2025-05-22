import { saveCondition } from '@/app/lib/db';
import { hasMaskedValue } from '@/app/lib/handlers/maskedToken';
import { error } from 'console';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
    try {
        const data = await request.json();
        if (!hasMaskedValue(data)) {
            if (process.env.DB_TYPE === 'mysql') {
                const name = "apiKey"
                await saveCondition(name, JSON.stringify(data));
            } else if (process.env.DB_TYPE === 'sqlite') {
                const filePath = path.join(process.cwd(), 'src/app/data/condition.json');
                fs.writeFileSync(filePath, JSON.stringify({ token: data }, null, 2));
            } else { return Response.json({ error }) }
        } else {
            return Response.json(
                { error: 'Input contains masked token values, please enter full token' },
                { status: 400 }
            );
        }
        return Response.json({ success: true });
    } catch (error) {
        console.error('Error updating condition:', error);
        return Response.json(
            { error: 'Failed to update condition' },
            { status: 500 }
        );
    }
}