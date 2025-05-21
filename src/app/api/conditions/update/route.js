import { saveCondition } from '@/app/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
    try {
        const data = await request.json();

        if (process.env.DB_TYPE === 'mysql') {
            // MySQL - lưu vào database với name cố định là 'config'
            await saveCondition('apiKey', data);
        } else {
            // SQLite - ghi vào file json
            const filePath = path.join(process.cwd(), 'src/app/data/condition.json');
            fs.writeFileSync(filePath, JSON.stringify({ token: data }, null, 2));
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