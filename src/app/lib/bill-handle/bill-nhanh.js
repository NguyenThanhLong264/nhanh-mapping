// src/app/lib/bill-handle/bill-nhanh.js

import axios from 'axios';
import FormData from "form-data";
import { readCondition } from "../handlers/readJSON.js";

let lastNhanhCall = 0;
const nhanhMinInterval = 350;

export async function throttleNhanh() {
    const now = Date.now();
    const elapsed = now - lastNhanhCall;
    if (elapsed < nhanhMinInterval) {
        await new Promise(res => setTimeout(res, nhanhMinInterval - elapsed));
    }
    lastNhanhCall = Date.now();
}

export async function fetchNhanhBills({ fromDate, toDate, page = 1 }) {
    const condition = await readCondition();

    const formData = new FormData();
    formData.append('version', condition.NhanhVN_Version || '2.0');
    formData.append('appId', condition.NhanhVN_AppId || '');
    formData.append('businessId', condition.NhanhVN_BusinessId || '');
    formData.append('accessToken', condition.NhanhVN_AccessToken || '');
    formData.append('data', JSON.stringify({ page, fromDate, toDate }));

    try {
        const response = await axios.post('https://open.nhanh.vn/api/bill/search', formData, {
            headers: formData.getHeaders(),
        });

        if (response.data.code === 1) {
            return {
                totalPages: response.data.data.totalPages,
                page: response.data.data.page,
                bills: response.data.data.bill,
            };
        } else {
            console.error('API lỗi:', response.data);
            return null;
        }
    } catch (error) {
        console.error('Lỗi gọi API bill/search:', error.message);
        return null;
    }
}
