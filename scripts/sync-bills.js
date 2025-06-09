// scripts/sync-bills.js
import { loadBillConfig } from '../src/app/lib/bill-handle/bill-config.js';
import { readCondition } from '../src/app/lib/handlers/readJSON.js';
import { fetchNhanhBills } from '../src/app/lib/bill-handle/bill-nhanh.js';
import { mapBilltoDeal } from '../src/app/lib/bill-handle/bill-map.js';
import { checkBillExists } from '../src/app/lib/bill-handle/bill-db.js';
import { createCSdealNoMapping } from '../src/app/lib/bill-handle/bill-createdeal.js';

async function syncBills(fromDate, toDate) {
    const config = await loadBillConfig();
    const condition = await readCondition();
    const firstPageData = await fetchNhanhBills({ fromDate, toDate, page: 1 });
    if (!firstPageData) return;
    let totalPages = firstPageData.totalPages;

    for (let page = totalPages; page >= 1; page--) {
        try {
            const pageData = page === 1 ? firstPageData : await fetchNhanhBills({ fromDate, toDate, page });
            if (!pageData) continue;

            const bills = pageData.bills;
            for (const billId in bills) {
                try {
                    const exists = await checkBillExists(billId);
                    if (exists) {
                        console.log(`Bill ${billId} đã tồn tại, bỏ qua.`);
                        continue;
                    }
                    const bill = await mapBilltoDeal(bills[billId]);
                    const response = await createCSdealNoMapping(bill);
                } catch (e) {
                    console.error(`Lỗi xử lý bill ${billId}:`, e);
                }
            }
        } catch (e) {
            console.error(`Lỗi xử lý trang ${page}:`, e);
        }
    }
}

function getTodayDate() {
    return new Date().toISOString().slice(0, 10);
}

async function syncTodayBills() {
    const today = getTodayDate();
    await syncBills(today, today);
}

export { syncBills, syncTodayBills };

