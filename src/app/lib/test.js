import { loadBillConfig } from '../src/app/lib/bill-handle/bill-config.js';

async function test() {
    try {
        const config = await loadBillConfig();
        console.log('[TEST] Config loaded:', config);
    } catch (error) {
        console.error('[TEST] Error loading config:', error);
    }
}

test();
