// lib/services/nhanh/fetchCustomerInfo.js
import axios from 'axios';
import FormData from 'form-data';
import { getConditionByName } from '../db.js';
import { readCondition } from '../handlers/readJSON.js';
import { throttleNhanh } from '../bill-handle/bill-nhanh.js';

export async function fetchCustomerInfo(customerId) {
    if (!customerId) return null;

    let token;
    if (process.env.DB_TYPE === 'mysql') {
        token = await getConditionByName("apiKey");
    } else if (process.env.DB_TYPE === 'sqlite') {
        token = await readCondition();
    }

    const { NhanhVN_Version, NhanhVN_AppId, NhanhVN_BusinessId, NhanhVN_AccessToken } = token;
    const formData = new FormData();

    formData.append('version', NhanhVN_Version);
    formData.append('appId', NhanhVN_AppId);
    formData.append('businessId', NhanhVN_BusinessId);
    formData.append('accessToken', NhanhVN_AccessToken);
    formData.append('data', JSON.stringify({ page: 1, id: customerId.toString() }));

    await throttleNhanh();
    try {
        const response = await axios.post('https://open.nhanh.vn/api/customer/search', formData, {
            headers: formData.getHeaders(),
        });

        const result = response.data;

        if (
            result.code === 1 &&
            result.data?.customers &&
            result.data.customers[customerId]
        ) {
            const rawCustomer = result.data.customers[customerId];
            const customerData = {};
            for (const key in rawCustomer) {
                customerData[`customer_${key}`] = rawCustomer[key];
            }
            return customerData;
        }

        console.warn(`Customer ${customerId} not found in response.`);
        return null;
    } catch (error) {
        console.error(`fetchCustomerInfo error: ${error.message}`);
        return null;
    }
}
