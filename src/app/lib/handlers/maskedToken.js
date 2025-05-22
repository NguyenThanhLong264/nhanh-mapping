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
