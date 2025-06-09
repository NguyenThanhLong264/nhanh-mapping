import axios from 'axios';
import { isCustomerExsit } from '../handlers/customerProccessing.js';
import { readCondition } from '../handlers/readJSON.js';

let lastCallTime = 0;  // thời điểm gọi hàm cuối cùng (ms)
const minInterval = 100; // 100 ms giữa 2 lần gọi => max 10 calls/s

export async function throttleCareSoft() {
    const now = Date.now();
    const diff = now - lastCallTime;
    if (diff < minInterval) {
        await new Promise(resolve => setTimeout(resolve, minInterval - diff));
    }
    lastCallTime = Date.now();
}

export async function createCSdealNoMapping(dealData) {
    let token;
    if (process.env.DB_TYPE === 'mysql') {
        const { getConditionByName } = await import('../db.js');
        token = await getConditionByName("apiKey");
    } else if (process.env.DB_TYPE === 'sqlite') {
        token = await readCondition();
    }

    await throttleCareSoft();
    async function sendDeal(dealPayload) {
        const axiosConfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://api.caresoft.vn/${token.CareSoft_Domain}/api/v1/deal`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.CareSoft_ApiToken}`,
            },
            data: JSON.stringify({ deal: dealPayload }),
        };
        return axios.request(axiosConfig);
    }

    try {
        let web2Response;

        try {
            web2Response = await sendDeal(dealData);
        } catch (error) {
            const errorMsg = error.response?.data?.message || '';

            if (errorMsg.includes('attributes can missing: requester_id, email, phone or username')) {
                console.warn('Retrying with fallback phone number due to missing attributes error');
                const fallbackDeal = { ...dealData, phone: '0987654321' };
                try {
                    web2Response = await sendDeal(fallbackDeal);
                } catch (retryError) {
                    console.error('Retry with fallback phone failed:', retryError.message);
                    return {
                        status: 500,
                        error: retryError.message,
                        details: retryError.response?.data,
                    };
                }
            } else if (errorMsg.includes('not found product with sku')) {
                console.warn('Retrying without order_products due to invalid SKU');
                const cleanedDeal = { ...dealData };
                delete cleanedDeal.order_products;
                try {
                    web2Response = await sendDeal(cleanedDeal);
                } catch (retryError) {
                    console.error('Retry failed:', retryError.message);
                    return {
                        status: 500,
                        error: retryError.message,
                        details: retryError.response?.data,
                    };
                }
            } else {
                throw error;
            }
        }

        // Kiểm tra khách hàng
        if (dealData.phone) {
            console.log("There is a mobile phone:", dealData.phone);
            const customerExists = await isCustomerExsit(dealData);
            if (customerExists === true) {
                console.log('Customer exists, updated');
            } else if (customerExists === false) {
                console.log('Customer does not exist');
            } else {
                console.error('Error checking customer:', customerExists);
            }
        } else {
            console.log("There no phone:", dealData.phone);
        }

        return {
            status: 200,
            data: web2Response.data,
        };
    } catch (error) {
        console.error('createCSdealNoMapping - Error:', error.message);
        console.error('createCSdealNoMapping - Error details:', error.response?.data);

        return {
            status: 500,
            error: error.message,
            details: error.response?.data,
        };
    }
}
