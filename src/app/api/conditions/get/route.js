import { getConditionByName } from '@/app/lib/db';
import { readCondition } from '@/app/lib/handlers/readJSON';
import maskSensitiveFields from '@/app/lib/handlers/maskedToken';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        let value

        if (process.env.DB_TYPE === 'mysql') {
            value = await getConditionByName(name);
            if (!value) {
                value = condition.token;
            }
        } else {
            const condition = await readCondition();
            value = condition;
        }
        return Response.json(value)
    } catch (error) {
        console.error('Error getting condition:', error);
        return Response.json(
            { error: 'Failed to get condition' },
            { status: 500 }
        );
    }
}