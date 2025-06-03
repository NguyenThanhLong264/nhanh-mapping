// lib/handlers/orderAddHandler.js
import { mapToDealFormat } from './commonOrderUtils.js';
import { createCSdeal } from '../services/createCSdeal.js';
import { fetchFullOrderData } from '../services/fetchOrderNhanh.js';

export async function handleOrderAdd(body) {
  console.log('Handling orderAdd');
  // console.log('handleOrderAdd - body', body);
  const data = body.data
  const fullOrder = await fetchFullOrderData(data.orderId)
  // console.log("Fullorder fetched", fullOrder);

  const dealData = await mapToDealFormat(fullOrder);
  const response = await createCSdeal(dealData, body);
  return {
    status: response.status,
    data: response.data
  };
}
