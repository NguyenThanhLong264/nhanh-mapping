// lib/services/nhanh/fetchFullOrderData.js
import axios from 'axios';
import FormData from 'form-data';
import { getConditionByName } from '../db';
import { readCondition } from '../handlers/readJSON';
import { fetchCustomerInfo } from './fetchCustomerNhanhvn';
import { throttleNhanh } from '../bill-handle/bill-nhanh';

export async function fetchFullOrderData(orderId) {
    let token;
    if (process.env.DB_TYPE === 'mysql') {
        token = await getConditionByName("apiKey")

    } else if (process.env.DB_TYPE === 'sqlite') {
        const condition = await readCondition();
        token = condition;
    }
    try {
        const { NhanhVN_Version, NhanhVN_AppId, NhanhVN_BusinessId, NhanhVN_AccessToken } = token;

        const formData = new FormData();
        formData.append('version', NhanhVN_Version);
        formData.append('appId', NhanhVN_AppId);
        formData.append('businessId', NhanhVN_BusinessId);
        formData.append('accessToken', NhanhVN_AccessToken);
        formData.append('data', JSON.stringify({ page: 1, id: orderId.toString() }));

        await throttleNhanh();

        const response = await axios.post('https://open.nhanh.vn/api/order/index', formData, {
            headers: formData.getHeaders(),
        });

        const result = response.data;
        if (result.code === 1 && result.data?.orders?.[orderId]) {
            const fullOrder = result.data.orders[orderId];
            fullOrder.orderId = fullOrder.id;
            fullOrder.status = fullOrder.statusCode;

            if (Array.isArray(fullOrder.products)) {
                fullOrder.products = fullOrder.products.map((p) => ({
                    ...p,
                    id: p.productId,
                }));
            }
            if (fullOrder.customerId) {
                const customerData = await fetchCustomerInfo(fullOrder.customerId);
                if (customerData) {
                    Object.assign(fullOrder, customerData);
                }
            }
            return fullOrder;
        }

        console.warn(`Order ${orderId} not found in response, fallback to webhook`);
        return null;
    } catch (err) {
        console.error('fetchFullOrderData error:', err.message);
        return null;
    }
}
