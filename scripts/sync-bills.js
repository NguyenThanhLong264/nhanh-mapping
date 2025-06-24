// scripts/sync-bills.js
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { fetchNhanhBills, throttleNhanh } from '../src/app/lib/bill-handle/bill-nhanh.js';
import { mapBilltoDeal } from '../src/app/lib/bill-handle/bill-map.js';
import { checkBillExists, saveBillDealMapping } from '../src/app/lib/bill-handle/bill-db.js';
import { createCSdealNoMapping } from '../src/app/lib/bill-handle/bill-createdeal.js';
import { fetchCustomerInfo } from '../src/app/lib/services/fetchCustomerNhanhvn.js';

async function syncBills(fromDate, toDate) {
    const firstPageData = await fetchNhanhBills({ fromDate, toDate, page: 1 });
    if (!firstPageData) return;

    const totalPages = firstPageData.totalPages;

    for (let page = totalPages; page >= 1; page--) {
        try {
            if (page !== 1) {
                await throttleNhanh();
            }
            const pageData = page === 1 ? firstPageData : await fetchNhanhBills({ fromDate, toDate, page });
            if (!pageData) continue;
            const bills = pageData.bills;
            for (const billId in bills) {
                console.log('[DEBUG] Current page:', page);
                try {
                    const rawBill = bills[billId];
                    if (rawBill.type !== "2" || rawBill.mode !== "2") {
                        console.log(`Bill ${billId} bị bỏ qua do không phải type=2 & mode=2 (type=${rawBill.type}, mode=${rawBill.mode})`);
                        continue;
                    }
                    
                    const exists = await checkBillExists(billId);
                    if (exists) {
                        console.log(`Bill ${billId} đã tồn tại, bỏ qua.`);
                        continue;
                    }

                    if (rawBill.orderId && rawBill.orderId !== "") {
                        console.log(`Bill ${billId} có orderId (${rawBill.orderId}), bỏ qua.`);
                        continue;
                    }
                    if (rawBill.customerId && rawBill.customerId !== "") {
                        const customerData = await fetchCustomerInfo(rawBill.customerId);
                        if (customerData) {
                            Object.assign(rawBill, customerData);
                        }
                    }
                    const bill = await mapBilltoDeal(rawBill);
                    const response = await createCSdealNoMapping(bill);
                    if (response?.status === 200 && response.data?.deal?.id) {
                        const dealId = response.data.deal.id;
                        await saveBillDealMapping(billId, dealId);
                    } else {
                        console.warn(`Không thể lưu mapping vì thiếu deal_id cho bill ${billId}`);
                    }
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
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (hours === 0 || (hours === 1 && minutes <= 45)) {
        const targetDates = [];
        for (let i = 3; i >= 1; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            targetDates.push(d.toISOString().slice(0, 10));
        }

        console.log(`[SYNC] Trong khung giờ 0h - 1h45, đồng bộ 3 ngày gần nhất: ${targetDates.join(', ')}`);

        for (const date of targetDates) {
            try {
                await syncBills(date, date);
            } catch (err) {
                console.error(`[SYNC] Lỗi khi đồng bộ ngày ${date}:`, err);
            }
        }
    } else {
        const targetDate = getTodayDate();
        console.log(`[SYNC] Đồng bộ ngày hôm nay: ${targetDate}`);
        await syncBills(targetDate, targetDate);
    }
}


async function syncByMode() {
    const syncModePath = join(process.cwd(), 'data', 'sync-mode.json');
    let modeConfig;
    try {
        modeConfig = JSON.parse(readFileSync(syncModePath, 'utf-8'));
    } catch (err) {
        console.warn('[SYNC MODE] Không đọc được sync-mode.json, chạy chế độ mặc định.');
        return await syncTodayBills();
    }

    if (modeConfig.mode === 'override' && modeConfig.fromDate && modeConfig.toDate) {
        const from = new Date(modeConfig.fromDate);
        const to = new Date(modeConfig.toDate);

        while (from <= to) {
            const dateStr = from.toISOString().slice(0, 10);
            console.log(`[SYNC OVERRIDE] Đang đồng bộ ngày ${dateStr}`);
            await syncBills(dateStr, dateStr);
            from.setDate(from.getDate() + 1);
        }

        writeFileSync(syncModePath, JSON.stringify({ mode: 'normal' }, null, 2));
        console.log('[SYNC OVERRIDE] Hoàn tất. Đã chuyển về chế độ "normal".');
    } else {
        await syncTodayBills();
    }
}

export { syncBills, syncTodayBills, syncByMode };

