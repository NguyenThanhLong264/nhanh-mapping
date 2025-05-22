// lib/services/deal/updateDeal.js
import axios from 'axios';
import condition from '../../data/condition.json';
import { mapToDealFormatForUpdate } from '../handlers/commonOrderUtils';
import { getConditionByName } from '../db';

export async function updateDeal(data, dealId) {
    let token;
    if (process.env.DB_TYPE === 'mysql') {
        token = await getConditionByName("apiKey")
    } else if (process.env.DB_TYPE === 'sqlite') {
        token = condition.token;
    }
    console.log('Updating deal with raw data:', JSON.stringify(data, null, 2));
    try {
        const dealUpdate = await mapToDealFormatForUpdate(data); // Thêm await
        console.log('Deal after mapping:', JSON.stringify(dealUpdate, null, 2));

        const axiosConfig = {
            method: 'put',
            url: `https://api.caresoft.vn/${token.CareSoft_Domain}/api/v1/deal/${dealId}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.CareSoft_ApiToken}`,
            },
            data: { deal: dealUpdate } // Bỏ JSON.stringify
        };

        const res = await axios.request(axiosConfig);
        return res.data;
    } catch (error) {
        console.error('Error updating deal:', error.response?.data || error.message);
        throw error;
    } finally {
        console.log('Update deal process completed');
    }
}
