// cron-runner.js
import dotenv from 'dotenv';
dotenv.config();

import cron from 'node-cron';
import { syncTodayBills } from './scripts/sync-bills.js';

let isRunning = false;

console.log('[CRON] Scheduler khởi động...');

function msToNextRun() {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    const nextRunMinute = Math.ceil((minutes + 1) / 2) * 2;

    let nextRun = new Date(now);
    if (nextRunMinute < 60) {
        nextRun.setMinutes(nextRunMinute, 0, 0);
    } else {
        nextRun.setHours(now.getHours() + 1, 0, 0, 0);
    }

    return nextRun - now; // ms đến lần chạy tiếp theo
}

const msWait = msToNextRun();
const waitMin = Math.floor(msWait / 60000);
const waitSec = Math.floor((msWait % 60000) / 1000);

function countdownTimer(ms) {
    let remaining = ms;
    const interval = 1000; // 1 giây

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

cron.schedule('*/2 * * * *', async () => {
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
        const elapsed = endTime - startTime; // ms
        const waitMs = CRON_INTERVAL_MS - elapsed;
        const safeWaitMs = waitMs > 0 ? waitMs : 0;
        const waitMin = Math.floor(safeWaitMs / 60000);
        const waitSec = Math.floor((safeWaitMs % 60000) / 1000);

        console.log(`[CRON] Tiếp theo đồng bộ sau ${waitMin} phút ${waitSec} giây.`);
    }
});
