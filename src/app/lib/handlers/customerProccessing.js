import axios from "axios";
import { getConditionByName } from "../db";

let token;
if (process.env.DB_TYPE === 'mysql') {
    token = await getConditionByName("apiKey")

} else if (process.env.DB_TYPE === 'sqlite') {
    token = condition.token;
}

export async function isCustomerExsit(deal) {
    const customerPhone = deal.phone;
    try {
        const axiosConfig = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.caresoft.vn/${token.CareSoft_Domain}/api/v1/contactsByPhone?phoneNo=${customerPhone}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.CareSoft_ApiToken}`,
            }
        }
        const response = await axios.request(axiosConfig)
        const data = response.data;

        if (data.code === "ok" && data.contact) {
            const contact = data.contact;
            await updateCustomer(deal, contact.id);  // Added await here
            return true;
        } else if (data.code === "errors" && data.message === "Not found user, creating") {
            const contact = data.contact;
            await createCustomer(contact);  // Added await here
            return false;
        } else {
            return {
                status: 500,
                error: 'Unexpected response structure',
                details: data,
            };
        }
    } catch (error) {
        console.error('Check Customer - Error:', error.message);
        console.error('Check Customer - Error details:', error.response?.data);

        return {
            status: 500,
            error: error.message,
            details: error.response?.data,
        };
    }
}

export async function updateCustomer(contact, id) {
    try {
        console.log(`Updating customer with ID: ${id}`);
        console.log('Customer data:', contact);

        const data = JSON.stringify({
            contact: {
                username: contact.username
            }
        });

        const config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: `https://api.caresoft.vn/${token.CareSoft_Domain}/api/v1/contacts/${id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.CareSoft_ApiToken}`
            },
            data: data
        };

        console.log('Sending update request...');
        const response = await axios.request(config);
        console.log('Update successful:', response.data);

        return {
            status: 200,
            data: response.data
        };
    } catch (error) {
        console.error('Update Customer - Error:', error.message);
        console.error('Update Customer - Error details:', error.response?.data);
        return {
            status: error.response?.status || 500,
            error: error.message,
            details: error.response?.data
        };
    }
}

export async function createCustomer(contact) {
    try {
        console.log('Creating new customer');
        console.log('Customer data:', contact);

        const data = JSON.stringify({
            contact: {
                phone_no: contact.phone_no,
                username: contact.username
            }
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://api.caresoft.vn/${token.CareSoft_Domain}/api/v1/contacts`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.CareSoft_ApiToken}`
            },
            data: data
        };

        console.log('Sending create request...');
        const response = await axios.request(config);
        console.log('Create successful:', response.data);

        return {
            status: 200,
            data: response.data
        };
    } catch (error) {
        console.error('Create Customer - Error:', error.message);
        console.error('Create Customer - Error details:', error.response?.data);
        return {
            status: error.response?.status || 500,
            error: error.message,
            details: error.response?.data
        };
    }
}
