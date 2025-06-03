import { mapToDealFormat } from './commonOrderUtils.js';
import { createCSdeal } from '../services/createCSdeal.js';
import { getDealIdByOrderId } from '../../lib/db.js'
import { fetchFullOrderData } from '../services/fetchOrderNhanh.js'
import { updateDeal } from '../services/updateCSdeal.js'

export async function handleOrderUpdate(body) {
  console.log('Handling orderUpdate');
  const data = body.data;

  const dealId = await getDealIdByOrderId(data.orderId);
  let fetchOrderData;
  let response;
  if (!dealId) {
    fetchOrderData = await fetchFullOrderData(data.orderId)
    const dealData = await mapToDealFormat(fetchOrderData);
    response = await createCSdeal(dealData, body);
  } else {
    response = await updateDeal(data, dealId)
  }

  return {
    status: response.status,
    data: response.data
  };
}
