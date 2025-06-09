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
        await db('bill_deal_mapping').insert({
            bill_id: bill_id,
            deal_id: deal_id,
            created_at: new Date(),
        });
        console.log(`Đã lưu mapping: Bill ${bill_id} => Deal ${deal_id}`);
    } catch (error) {
        console.error(`Lỗi khi lưu mapping cho bill ${bill_id}:`, error);
    }
}
