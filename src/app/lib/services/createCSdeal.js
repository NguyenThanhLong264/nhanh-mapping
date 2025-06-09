import axios from 'axios';
import { getConditionByName, saveOrderDealMapping } from '../db.js';
import { isCustomerExsit } from '../handlers/customerProccessing.js';
import { readCondition } from '../handlers/readJSON.js';

export async function createCSdeal(dealData, body) {
  let token;
  if (process.env.DB_TYPE === 'mysql') {
    token = await getConditionByName("apiKey");
  } else if (process.env.DB_TYPE === 'sqlite') {
    const condition = await readCondition();
    token = condition;
  }

  const data = body.data;
  const orderId = data.orderId;
  const businessId = body.businessId;

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
          console.error('Retry details:', retryError.response?.data);
          return {
            status: 500,
            error: retryError.message,
            details: retryError.response?.data,
          };
        }
      }
      else if (errorMsg.includes('not found product with sku')) {
        console.warn('Retrying without order_products due to invalid SKU');
        const cleanedDeal = { ...dealData };
        delete cleanedDeal.order_products;
        try {
          web2Response = await sendDeal(cleanedDeal);
        } catch (retryError) {
          console.error('Retry failed:', retryError.message);
          console.error('Retry details:', retryError.response?.data);
          return {
            status: 500,
            error: retryError.message,
            details: retryError.response?.data,
          };
        }
      }
      else {
        throw error;
      }
    }


    const dealId = web2Response.data.deal?.id;
    const appid = token.NhanhVN_AppId;
    if (orderId && dealId && businessId && appid) {
      try {
        await saveOrderDealMapping(orderId.toString(), dealId.toString(), businessId.toString(), appid);
        console.log(`createCSdeal - Saved mapping: order_id=${orderId}, deal_id=${dealId}, business_id=${businessId}, appid=${appid}`);
      } catch (dbError) {
        console.warn('createCSdeal - Database save failed, continuing without mapping:', dbError.message);
      }
    } else {
      console.error('createCSdeal - Missing fields for mapping:', { orderId, dealId, businessId, appid });
    }

    if (dealData.phone) {
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
    console.error('createCSdeal - Error:', error.message);
    console.error('createCSdeal - Error details:', error.response?.data);

    return {
      status: 500,
      error: error.message,
      details: error.response?.data,
    };
  }
}
