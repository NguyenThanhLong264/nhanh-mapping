// lib/services/deal/updateDeal.js
import axios from 'axios';
import { mapToDealFormatForUpdate } from '../handlers/commonOrderUtils';
import { getConditionByName } from '../db';
import { readCondition } from '../handlers/readJSON';
import { isCustomerExsit } from '../handlers/customerProccessing';
import { throttleCareSoft } from '../bill-handle/bill-createdeal';

export async function updateDeal(data, dealId) {
    let token;
    if (process.env.DB_TYPE === 'mysql') {
        token = await getConditionByName("apiKey")
    } else if (process.env.DB_TYPE === 'sqlite') {
        const condition = await readCondition();
        token = condition;
    }
    try {
        await throttleCareSoft();
        const dealUpdate = await mapToDealFormatForUpdate(data);
        const axiosConfig = {
            method: 'put',
            url: `https://api.caresoft.vn/${token.CareSoft_Domain}/api/v1/deal/${dealId}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.CareSoft_ApiToken}`,
            },
            data: { deal: dealUpdate } // Bỏ JSON.stringify
        };

        if (dealUpdate.phone) {
            const customerExists = await isCustomerExsit(dealUpdate.phone)
            if (customerExists === true) {
                console.log('Customer exists, updated');
            } else if (customerExists === false) {
                console.log('Customer does not exist');
            } else {
                console.error('Error checking customer:', customerExists);
            }
        } else {
            console.log("There no phone:", dealUpdate.phone);
        }

        const res = await axios.request(axiosConfig);
        return res.data;
    } catch (error) {
        console.error('Error updating deal:', error.response?.data || error.message);
        throw error;
    } finally {
        console.log('Update deal process completed');
    }
}
