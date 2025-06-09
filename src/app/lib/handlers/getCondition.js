// src/app/lib/handlers/getCondition.js
import { getConditionByName } from "../db.js";
import { readCondition } from "./readJSON.js";

let cachedToken = null;

export async function getToken() {
    if (cachedToken) return cachedToken;

    if (process.env.DB_TYPE === 'mysql') {
        cachedToken = await getConditionByName("apiKey");
    } else if (process.env.DB_TYPE === 'sqlite') {
        cachedToken = await readCondition();
    }

    return cachedToken;
}
