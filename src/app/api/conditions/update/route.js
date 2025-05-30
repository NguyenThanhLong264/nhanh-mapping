import { saveCondition } from '@/app/lib/db';
import { hasMaskedValue } from '@/app/lib/handlers/maskedToken';
import { writeCondition } from '@/app/lib/handlers/readJSON';

export async function POST(request) {
    try {
        const data = await request.json();
        if (!hasMaskedValue(data)) {
            if (process.env.DB_TYPE === 'mysql') {
                const name = "apiKey"
                await saveCondition(name, JSON.stringify(data));
            } else if (process.env.DB_TYPE === 'sqlite') {
                await writeCondition(data)
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