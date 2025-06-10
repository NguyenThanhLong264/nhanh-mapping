// src/app/lib/cron-ultils/calcTime.js

/**
 * Tính số mili giây đến lần chạy tiếp theo dựa trên khoảng thời gian truyền vào
 * @param {number} intervalMin - Khoảng cách giữa các lần chạy, tính bằng phút (0, 2, 5, 30, ...)
 * @returns {number} Thời gian chờ tính bằng ms
 */
export function msToNextRun(intervalMin = 0) {
    const now = new Date();
    const next = new Date(now);

    if (intervalMin <= 0) {
        // Mặc định: đầu mỗi giờ
        next.setHours(now.getHours() + 1);
        next.setMinutes(0, 0, 0);
    } else if (60 % intervalMin === 0) {
        // Các mốc chia hết 60 phút: 2, 5, 10, 30, v.v.
        const currentMin = now.getMinutes();
        const remainder = currentMin % intervalMin;
        const minutesToAdd = remainder === 0 ? intervalMin : intervalMin - remainder;

        next.setMinutes(currentMin + minutesToAdd);
        next.setSeconds(0);
        next.setMilliseconds(0);

        // Nếu qua giờ thì tăng giờ
        if (next.getMinutes() >= 60) {
            next.setHours(next.getHours() + 1);
            next.setMinutes(0);
        }
    } else {
        throw new Error(`intervalMin (${intervalMin}) không hợp lệ. Chỉ hỗ trợ giá trị chia hết cho 60.`);
    }

    return next - now;
}

/**
 * Tính số mili giây còn lại đến thời điểm chạy tiếp theo tại phút cụ thể trong mỗi giờ.
 *
 * Ví dụ: nếu `targetMinute = 30`, hàm sẽ trả về thời gian còn lại đến 1h30, 2h30, 3h30, ...
 *
 * @param {number} targetMinute - Phút mục tiêu trong mỗi giờ (từ 0 đến 59).
 * @returns {number} Thời gian chờ tính bằng mili giây (ms) đến thời điểm chạy tiếp theo.
 *
 * @throws {Error} Nếu `targetMinute` không nằm trong khoảng 0–59.
 */
export function msToNextRunAtMinute(targetMinute = 0) {
    if (targetMinute < 0 || targetMinute >= 60) {
        throw new Error(`targetMinute (${targetMinute}) không hợp lệ. Phải nằm trong khoảng 0–59.`);
    }

    const now = new Date();
    const next = new Date(now);

    if (now.getMinutes() < targetMinute) {
        next.setMinutes(targetMinute, 0, 0);
    } else {
        next.setHours(now.getHours() + 1);
        next.setMinutes(targetMinute, 0, 0);
    }

    return next - now;
}

/**
 * Trả về Date object cho lần chạy kế tiếp, dựa trên kiểu chạy và phút
 *
 * @param {'interval' | 'fixed'} type - Kiểu chạy: 'interval' hoặc 'fixed'
 * @param {number} minute - Số phút tương ứng với kiểu chạy
 * @returns {Date} Ngày giờ tiếp theo sẽ chạy
 */
export function nextSyncDate(type = 'interval', minute = 0) {
    const ms = msToNextRunByType(type, minute);
    return new Date(Date.now() + ms);
}

/**
 * Tính số ms đến lần chạy tiếp theo theo kiểu xác định.
 *
 * @param {'interval' | 'fixed'} type - Kiểu chạy: 'interval' cho mỗi X phút, 'fixed' cho phút cố định trong giờ.
 * @param {number} minute - Giá trị phút: nếu 'interval' thì là khoảng cách phút; nếu 'fixed' thì là phút cụ thể trong giờ.
 * @returns {number} Thời gian chờ tính bằng ms
 */
export function msToNextRunByType(type = 'interval', minute = 0) {
    if (type === 'interval') {
        return msToNextRun(minute);
    } else if (type === 'fixed') {
        return msToNextRunAtMinute(minute);
    } else {
        throw new Error(`Kiểu chạy không hợp lệ: ${type}`);
    }
}