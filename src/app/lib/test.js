import { syncByMode } from '../../../scripts/sync-bills.js';

async function test() {
    try {
        const config = await syncByMode();
        console.log('[TEST] Config loaded:', config);
    } catch (error) {
        console.error('[TEST] Error loading config:', error);
    }
}

test();
