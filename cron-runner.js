// cron-runner.js
import dotenv from 'dotenv';
dotenv.config();

import cron from 'node-cron';
import { syncTodayBills } from './scripts/sync-bills.js';

let isRunning = false;

console.log('[CRON] Scheduler khởi động...');

function msToNextRun() {
    const now = new Date();
    const nextRun = new Date(now);
    if (now.getMinutes() < 30) {
        nextRun.setMinutes(30, 0, 0);
    } else {
        nextRun.setHours(now.getHours() + 1);
        nextRun.setMinutes(30, 0, 0);
    }
    return nextRun - now;
}

const msWait = msToNextRun();

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

const CRON_INTERVAL_MS = 2 * 60 * 1000;

cron.schedule('*30 * * * *', async () => {
    if (isRunning) {
        console.log('[CRON] Tiến trình trước vẫn đang chạy, bỏ qua lần này.');
        return;
    }

    isRunning = true;
    const startTime = new Date();
    console.log(`[CRON] Bắt đầu đồng bộ lúc ${startTime.toISOString()}`);

    try {
        await syncTodayBills();
        console.log(`[CRON] Hoàn tất đồng bộ lúc ${new Date().toISOString()}`);
    } catch (err) {
        console.error('[CRON ERROR]', err);
    } finally {
        isRunning = false;

        const endTime = new Date();
        const elapsed = endTime - startTime;
        const waitMs = CRON_INTERVAL_MS - elapsed;
        const safeWaitMs = waitMs > 0 ? waitMs : 0;
        const waitMin = Math.floor(safeWaitMs / 60000);
        const waitSec = Math.floor((safeWaitMs % 60000) / 1000);

        console.log(`[CRON] Tiếp theo đồng bộ sau ${waitMin} phút ${waitSec} giây.`);
    }
});
