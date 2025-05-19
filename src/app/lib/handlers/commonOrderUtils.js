import { loadConfig, replacePlaceholders, configClassify } from '../services/webhookUtils';

function cleanEmptyValues(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) =>
      value !== null && value !== undefined && value !== ""
    )
  );
}

export async function mapToDealFormat(orderData) {
  const config = await loadConfig();
  const { normal, special, product, custom } = configClassify(config);
  const orderId = orderData.orderId;
  const deal = {};

  normal.forEach(obj => {
    const { name, typeInput, value } = obj;
    if (typeInput === "normal") {
      deal[name] = replacePlaceholders(value, orderData);
    } else if (typeInput === "map") {
      deal[name] = orderData[value];
    }
  });

  special.forEach(obj => {
    const { name, typeInput, value } = obj;
    if (typeInput === "pipeline_stage") {
      const matchedStage = value.find(stage => stage.value === orderData.status);
      deal[name] = matchedStage ? matchedStage.id : "";
      console.log(`Pipeline stage mapping: ${orderData.status} -> ${deal[name]}`);
    } else if (typeInput === "status") {
      const matchedStatus = value.find(status => status.value === orderData.status);
      deal[name] = matchedStatus ? matchedStatus.status : "ORDER_STARTED";
      console.log(`Order status mapping: ${orderData.status} -> ${deal[name]}`);
    }
  });

  product.forEach(obj => {
    const { name, typeInput, subFields } = obj;
    deal[name] = (orderData.products || []).map(product => {
      const mappedProduct = {};
      subFields.forEach(field => {
        const { name: fieldName, typeInput: fieldType, value } = field;
        if (fieldType === "normal") {
          mappedProduct[fieldName] = field.value || "";
        } else if (fieldType === "map") {
          mappedProduct[fieldName] = product[value] || "";
        }
      });
      return mappedProduct;
    });
  });

  custom.forEach(obj => {
    const { name, typeInput, value } = obj;

    if (Array.isArray(value)) {
      deal[name] = (value || []).map(item => ({
        ...item,
        value: replacePlaceholders(item.value, orderData)
      }));
    }
  });

  const cleanedDeal = cleanEmptyValues(deal);
  console.log("Final cleaned deal", cleanedDeal);
  return cleanedDeal;
}

export async function mapToDealFormatForUpdate(orderData) {
  const config = await loadConfig();
  const useConfig = config.filter(item => {
    const targetFields = ["businessId", "orderId", "shopOrderId", "status",
      "statusDescription", "depotId", "reason",
      "deliveryDate", "trackingUrl"];
    return targetFields.some(field => item.value === field) ||
      item.name.startsWith('comment.');
  });

  const deal = {};

  useConfig.forEach(obj => {
    const { name, value, typeInput } = obj;
    if (typeInput === "normal") {
      deal[name] = replacePlaceholders(value, orderData);
    } else if (typeInput === "map") {
      deal[name] = orderData[value];
    }
  });
  deal.comment = {
    body: deal["comment.body"] || "Order đã được cập nhật",
    is_public: deal["comment.is_public"] || "0",
    author_id: deal["comment.author_id"] || ""
  }
  delete deal["comment.body"];
  delete deal["comment.is_public"];
  delete deal["comment.author_id"];

  const cleanedDeal = cleanEmptyValues(deal);
  console.log("Final cleaned deal", cleanedDeal);
  return cleanedDeal;
}