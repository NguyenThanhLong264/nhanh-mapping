import { getDb } from '../db.js';

// Kiểm tra bill_id đã tồn tại chưa, trả về true/false
export async function checkBillExists(billId) {
    const db = await getDb();

    if (process.env.DB_TYPE === 'mysql') {
        const [rows] = await db.execute(
            'SELECT 1 FROM synced_bills WHERE bill_id = ? LIMIT 1',
            [billId]
        );
        return rows.length > 0;
    } else {
        const row = await db.get(
            'SELECT 1 FROM synced_bills WHERE bill_id = ? LIMIT 1',
            billId
        );
        return !!row;
    }
}

// Tạo mới hoặc cập nhật bill_id và deal_id (upsert)
export async function saveBillDealMapping(billId, dealId) {
    const db = await getDb();

    if (process.env.DB_TYPE === 'mysql') {
        await db.execute(
            `INSERT INTO synced_bills (bill_id, deal_id) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE deal_id = VALUES(deal_id)`,
            [billId, dealId]
        );
    } else {
        await db.run(
            'INSERT OR REPLACE INTO synced_bills (bill_id, deal_id) VALUES (?, ?)',
            billId,
            dealId
        );
    }
}
