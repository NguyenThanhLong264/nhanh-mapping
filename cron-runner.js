// cron-runner.js
import dotenv from 'dotenv';
dotenv.config();

import cron from 'node-cron';
import { syncByMode } from './scripts/sync-bills.js';
import { msToNextRunByType, nextSyncDate } from './src/app/lib/cron-ultils/calcTime.js';

let isRunning = false;
const INTERVAL_MINUTES = 20;
const msType = 'interval' // fixed - interval
const CRON_INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;
const msWait = msToNextRunByType(msType, INTERVAL_MINUTES);
const nextRunAt = nextSyncDate(msType, INTERVAL_MINUTES);

console.log('[CRON] Scheduler khởi động...');
console.log(`[CRON] Lần chạy tiếp theo vào lúc: ${nextRunAt.toLocaleString('vi-VN')}`);

function countdownTimer(ms) {
    let remaining = ms;
    const interval = 1000;

    const timerId = setInterval(() => {
        if (remaining <= 0) {
            clearInterval(timerId);
            return;
        }
        remaining -= interval;
        const min = Math.floor(remaining / 60000);
        const sec = Math.floor((remaining % 60000) / 1000);
        process.stdout.write(`\r[CRON COUNTDOWN] Còn ${min} phút ${sec} giây... `);
    }, interval);
}

countdownTimer(msWait);

cron.schedule('*/2 * * * *', async () => {
    if (isRunning) {
        console.log('[CRON] Tiến trình trước vẫn đang chạy, bỏ qua lần này.');
        return;
    }

    isRunning = true;
    const startTime = new Date();
    console.log(`[CRON] Bắt đầu đồng bộ lúc ${startTime.toISOString()}`);

    try {
        await syncByMode();
        console.log(`[CRON] Hoàn tất đồng bộ lúc ${new Date().toISOString()}`);
    } catch (err) {
        console.error('[CRON ERROR]', err);
    } finally {
        isRunning = false;

        const endTime = new Date();
        const elapsed = endTime - startTime;
        const waitMs = CRON_INTERVAL_MS - elapsed;
        const safeWaitMs = waitMs > 0 ? waitMs : 0;

        console.log(`[CRON] Lần chạy tiếp theo vào lúc: ${new Date(Date.now() + safeWaitMs).toLocaleString('vi-VN')}`);
        countdownTimer(safeWaitMs);
    }
});
