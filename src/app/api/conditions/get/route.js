import { getConditionByName } from '@/app/lib/db';
import conditions from '@/app/data/condition.json';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (process.env.DB_TYPE === 'mysql') {
            const value = await getConditionByName(name);
            if (!value) {
                return Response.json(conditions.token);
            }
            return Response.json(value);
        } else {
            // SQLite - lấy từ file json
            const value = conditions.token[name];
            return Response.json({ value });
        }
    } catch (error) {
        console.error('Error getting condition:', error);
        return Response.json(
            { error: 'Failed to get condition' },
            { status: 500 }
        );
    }
}