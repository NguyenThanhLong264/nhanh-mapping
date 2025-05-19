// lib/handlers/orderAddHandler.js
import { mapToDealFormat } from './commonOrderUtils.js';
import { createCSdeal } from '../services/createCSdeal.js';

export async function handleOrderAdd(body) {
  console.log('Handling orderAdd');
  console.log('handleOrderAdd - body', body);

  const dealData = await mapToDealFormat(body.data);
  const response = await createCSdeal(dealData, body);
  return {
    status: response.status,
    data: response.data
  };
}
