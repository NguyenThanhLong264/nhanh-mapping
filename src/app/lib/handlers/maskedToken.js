export default function maskSensitiveFields(obj) {
    const masked = {};
    for (const key in obj) {
        if (key.toLowerCase().includes('token')) {
            const val = obj[key];
            masked[key] = typeof val === 'string' && val.length > 5
                ? val.slice(0, 5) + '*'.repeat(val.length - 5)
                : '*****';
        } else {
            masked[key] = obj[key];
        }
    }
    return masked;
}

export function hasMaskedValue(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    for (const key in obj) {
        const value = obj[key];

        if (typeof value === 'string' && value.includes('*')) {
            return true;
        }

        if (typeof value === 'object' && value !== null) {
            if (hasMaskedValue(value)) {
                return true;
            }
        }
    }
    return false;
}
