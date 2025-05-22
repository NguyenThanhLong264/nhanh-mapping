import axios from 'axios';
import { saveOrderDealMapping } from '../db';
import condition from '../../data/condition.json'
import { isCustomerExsit } from '../handlers/customerProccessing';
import { getConditionByName } from '../db';

export async function createCSdeal(dealData, body) {
  let token;
  if (process.env.DB_TYPE === 'mysql') {
    token = await getConditionByName("apiKey")

  } else if (process.env.DB_TYPE === 'sqlite') {
    token = condition.token;
  }
  const data = body.data
  const orderId = data.orderId
  const businessId = body.businessId
  try {
    console.log("createCSdeal - Deal data:", dealData);

    const axiosConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://api.caresoft.vn/${token.CareSoft_Domain}/api/v1/deal`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.CareSoft_ApiToken}`,
      },
      data: JSON.stringify({ deal: dealData }),
    };

    const web2Response = await axios.request(axiosConfig);
    console.log('createCSdeal - Web 2 response:', JSON.stringify(web2Response.data));

    const dealId = web2Response.data.deal?.id;
    const appid = token.NhanhVN_AppId;

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
