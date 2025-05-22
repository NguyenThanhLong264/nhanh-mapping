import { getConditionByName } from '@/app/lib/db';
import conditions from '@/app/data/condition.json';
import maskSensitiveFields from '@/app/lib/handlers/maskedToken';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        let value

        if (process.env.DB_TYPE === 'mysql') {
            value = await getConditionByName(name);
            if (!value) {
                value = conditions.token;
            }
        } else {
            // SQLite - lấy từ file json
            value = conditions.token;
        }
        // console.log("Get Value:", value);
        return Response.json(maskSensitiveFields(value))
    } catch (error) {
        console.error('Error getting condition:', error);
        return Response.json(
            { error: 'Failed to get condition' },
            { status: 500 }
        );
    }
}