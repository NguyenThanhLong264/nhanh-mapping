import { NextResponse } from 'next/server';
import { loadConfig } from '@/app/lib/services/webhookUtils';
import { getConditionByName } from '@/app/lib/db';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (process.env.DB_TYPE === 'mysql') {
            const value = await getConditionByName(name);
            if (!value) {
                // Đọc file defaultConfig.json bằng fs
                const configPath = path.join(process.cwd(), 'src', 'app', 'data', 'defaultConfig.json');
                const data = await fs.readFile(configPath, 'utf-8');
                const jsonData = JSON.parse(data);

                // console.log("data:", jsonData);
                return NextResponse.json(jsonData, {
                    status: 200,
                    headers: {
                        'X-Config-Source': 'default'
                    }
                });
            }
            // console.log("Loaded value", value);
            return NextResponse.json(value, { status: 200 });
        } else if (process.env.DB_TYPE === 'sqlite') {
            const config = await loadConfig();
            return NextResponse.json(config, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Invalid DB_TYPE configuration' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error loading config:', error);
        return NextResponse.json({ error: 'Failed to load config' }, { status: 500 });
    }
}