import { getDb } from '../db.js';

// Kiểm tra bill_id đã tồn tại chưa, trả về true/false
export async function checkBillExists(bill_id) {
    const db = await getDb();

    if (process.env.DB_TYPE === 'mysql') {
        const [rows] = await db.execute(
            'SELECT 1 FROM synced_bills WHERE bill_id = ? LIMIT 1',
            [bill_id]
        );
        return rows.length > 0;
    } else {
        const row = await db.get(
            'SELECT 1 FROM synced_bills WHERE bill_id = ? LIMIT 1',
            bill_id
        );
        return !!row;
    }
}

// Tạo mới hoặc cập nhật bill_id và deal_id (upsert)
export async function saveBillDealMapping(bill_id, deal_id) {
    try {
        const db = await getDb();
        if (process.env.DB_TYPE === 'mysql') {
            await db.execute(
                `INSERT INTO synced_bills (bill_id, deal_id)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE deal_id = VALUES(deal_id)`,
                [bill_id, deal_id]
            );
        } else {
            await db.run(
                `INSERT INTO synced_bills (bill_id, deal_id)
                 VALUES (?, ?)
                 ON CONFLICT(bill_id) DO UPDATE SET deal_id=excluded.deal_id`,
                [bill_id, deal_id]
            );
        }
        console.log(`Đã lưu mapping: Bill ${bill_id} => Deal ${deal_id}`);
    } catch (error) {
        console.error(`Lỗi khi lưu mapping cho bill ${bill_id}:`, error);
    }
}

export async function saveSyncStatus({ sync_date, last_page }) {
    const db = await getDb();
    if (process.env.DB_TYPE === 'mysql') {
        await db.execute(
            `INSERT INTO sync_status (sync_date, last_page)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE last_page = ?`,
            [sync_date, last_page, last_page]
        );
    } else {
        await db.run(
            `INSERT INTO sync_status (sync_date, last_page)
             VALUES (?, ?)
             ON CONFLICT(sync_date) DO UPDATE SET last_page=excluded.last_page`,
            [sync_date, last_page]
        );
    }
}
