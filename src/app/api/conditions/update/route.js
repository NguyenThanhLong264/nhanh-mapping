import { saveCondition, getConditionByName } from '@/app/lib/db';
import { error } from 'console';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
    try {
        const data = await request.json();
        if (process.env.DB_TYPE === 'mysql') {
            const name = "apiKey"
            const value = data
            const current = await getConditionByName('apiKey');
            console.log("Current: ", current);
            console.log("Data: ", value);
            await saveCondition(name, JSON.stringify(value));
        } else if (process.env.DB_TYPE === 'sqlite') {
            const filePath = path.join(process.cwd(), 'src/app/data/condition.json');
            fs.writeFileSync(filePath, JSON.stringify({ token: data }, null, 2));
        } else { return Response.json({ error }) }

        return Response.json({ success: true });
    } catch (error) {
        console.error('Error updating condition:', error);
        return Response.json(
            { error: 'Failed to update condition' },
            { status: 500 }
        );
    }
}