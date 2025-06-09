import { promises as fs } from 'fs';
import path from 'path';

export async function saveBillConfig(configArray) {
    try {
        const configPath = path.join(process.cwd(), 'data', 'billConfig.json');
        const jsonString = JSON.stringify(configArray, null, 2);

        await fs.writeFile(configPath, jsonString, 'utf-8');
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to save config:', error);
        return { success: false, error };
    }
}

export async function loadBillConfig() {
    // console.log('[DEBUG] DB_TYPE:', process.env.DB_TYPE);
    if (process.env.DB_TYPE === 'mysql') {
        const result = await getConditionByName("config");
        console.log('[DEBUG] getConditionByName result:', result);
        return result;
    }
    else if (process.env.DB_TYPE === 'sqlite') {
        const configPath = path.join(process.cwd(), 'data', 'billConfig.json');
        try {
            const configData = await fs.readFile(configPath, 'utf8');
            // console.log('[DEBUG] Loaded config from file:', configData);
            return JSON.parse(configData);
        } catch (error) {
            console.log('Webhook - No config found, returning empty array');
            return [];
        }
    } else {
        console.log('[DEBUG] Unknown DB_TYPE, returning empty array');
        return [];
    }
}
