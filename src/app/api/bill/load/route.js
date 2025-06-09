import path from 'path';
import fs from 'fs/promises';
import { getConditionByName } from '@/app/lib/db';
import { loadBillConfig } from '@/app/lib/bill-handle/bill-config';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (process.env.DB_TYPE === 'mysql') {
            const value = await getConditionByName(name);
            if (!value) {
                const defaultConfigPath = path.join(process.cwd(), 'src', 'app', 'data', 'defaultConfig.json');
                const data = await fs.readFile(defaultConfigPath, 'utf-8');
                const jsonData = JSON.parse(data);

                return Response.json(jsonData, {
                    status: 200,
                    headers: {
                        'X-Config-Source': 'default',
                    },
                });
            }
            return Response.json(value, { status: 200 });
        }

        if (process.env.DB_TYPE === 'sqlite') {
            const config = await loadBillConfig();
            return Response.json(config, { status: 200 });
        }

        return Response.json(
            { error: 'Invalid DB_TYPE configuration' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error loading config:', error);
        return Response.json(
            { error: 'Failed to load config' },
            { status: 500 }
        );
    }
}
