export function convertDateInStringValues(obj) {
    const dateRegex = /\b(\d{4})-(\d{2})-(\d{2})(?:\s+\d{2}:\d{2}:\d{2})?\b/g;
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
            newObj[key] = value.replace(dateRegex, (_, y, m, d) => `${y}/${m}/${d}`);
        } else {
            newObj[key] = value;
        }
    }
    return newObj;
}
