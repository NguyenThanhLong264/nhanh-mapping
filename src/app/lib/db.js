import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import mysql from 'mysql2/promise';

let dbInstance = null;

async function getDb() {
    if (!dbInstance) {
        if (process.env.DB_TYPE === 'mysql') {
            dbInstance = await mysql.createConnection({
                host: process.env.MYSQL_HOST,
                port: process.env.MYSQL_PORT,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE,
                ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
            });
            // Thêm code tạo bảng cho MySQL
            await dbInstance.execute(`
                CREATE TABLE IF NOT EXISTS order_deal_mapping (
                    order_id VARCHAR(255) PRIMARY KEY,
                    deal_id VARCHAR(255) NOT NULL,
                    business_id VARCHAR(255) NOT NULL,
                    appid VARCHAR(255) NOT NULL
                )
            `);
            await dbInstance.execute(`
                CREATE TABLE IF NOT EXISTS config (
                name VARCHAR(255) NOT NULL PRIMARY KEY,
                value JSON NOT NULL
                );
            `);
        } else {
            // SQLite (mặc định)
            dbInstance = await open({
                filename: './src/app/data/webhook_mapping.db',
                driver: sqlite3.Database,
            });
            await dbInstance.run('PRAGMA journal_mode = WAL;');
            await dbInstance.run(`
                CREATE TABLE IF NOT EXISTS order_deal_mapping (
                    order_id TEXT PRIMARY KEY,
                    deal_id TEXT NOT NULL,
                    business_id TEXT NOT NULL,
                    appid TEXT NOT NULL
                )
            `);
        }
    }
    return dbInstance;
}

// Cập nhật các hàm truy vấn để hỗ trợ cả 2 loại DB
export async function getDealIdByOrderId(orderId) {
    const db = await getDb();
    if (process.env.DB_TYPE === 'mysql') {
        const [rows] = await db.execute(
            'SELECT deal_id FROM order_deal_mapping WHERE order_id = ?',
            [orderId]
        );
        return rows[0] ? rows[0].deal_id : null;
    } else {
        const result = await db.get(
            'SELECT deal_id FROM order_deal_mapping WHERE order_id = ?',
            orderId
        );
        return result ? result.deal_id : null;
    }
}

export async function saveOrderDealMapping(orderId, dealId, businessId, appId) {
    const db = await getDb();
    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            if (process.env.DB_TYPE === 'mysql') {
                await db.execute(
                    'INSERT INTO order_deal_mapping (order_id, deal_id, business_id, appid) VALUES (?, ?, ?, ?) ' +
                    'ON DUPLICATE KEY UPDATE deal_id = VALUES(deal_id), business_id = VALUES(business_id), appid = VALUES(appid)',
                    [orderId, dealId, businessId, appId]
                );
            } else {
                await db.run(
                    'INSERT OR REPLACE INTO order_deal_mapping (order_id, deal_id, business_id, appid) VALUES (?, ?, ?, ?)',
                    orderId,
                    dealId,
                    businessId,
                    appId
                );
            }
            console.log(`DB - Saved mapping: order_id=${orderId}, deal_id=${dealId}`);
            return;
        } catch (error) {
            if ((error.code === 'SQLITE_BUSY' || error.code === 'ER_LOCK_WAIT_TIMEOUT') &&
                attempt < maxRetries - 1) {
                attempt++;
                console.warn(`DB - ${error.code}, retrying ${attempt}/${maxRetries} for order_id=${orderId}`);
                await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
            } else {
                throw error;
            }
        }
    }
}

export async function saveCondition(name, value) {
    const db = await getDb();
    try {
        await db.execute(
            `INSERT INTO config (name, value) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE value = VALUES(value)`,
            [name, value]
        );
        // console.log(`DB - Saved condition: name=${name} `, value, result);
        return true;
    } catch (error) {
        console.error('DB - Error saving condition:', error);
        console.error('SQL State:', error.sqlState);
        console.error('Error Code:', error.errno);
        console.error('SQL Message:', error.sqlMessage);
        return false;
    }
}

export async function getConditionByName(name) {
    const db = await getDb();
    try {
        const [rows] = await db.execute(
            'SELECT value FROM config WHERE name = ?',
            [name]
        );
        console.log(`DB - Loaded condition: name=${name}`, rows[0].value);
        return rows[0] ? rows[0].value : null;
    } catch (error) {
        console.error('DB - Error getting condition:', error);
        return null;
    }
}


