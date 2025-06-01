import { loadConfig, replacePlaceholders, configClassify } from '../services/webhookUtils';
import { convertDateInStringValues } from './handerCustomFields';

function cleanEmptyValues(obj, exceptions = ["username", "phone", "email"]) {
  const normalizedObj = Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      let newValue = value === null ? "" : value;
      if (exceptions.includes(key) && (newValue === "" || newValue === undefined)) {
        newValue = "Unknow";
      }
      return [key, newValue];
    })
  );
  return Object.fromEntries(
    Object.entries(normalizedObj).filter(
      ([key, value]) => exceptions.includes(key) || (value !== "" && value !== undefined)
    )
  );
}


export async function mapToDealFormat(orderData) {
  const config = await loadConfig();
  const { normal, special, product, custom } = configClassify(config);
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
    } else if (typeInput === "status") {
      const matchedStatus = value.find(status => status.value === orderData.status);
      deal[name] = matchedStatus ? matchedStatus.status : "ORDER_STARTED";
    }
  });

  product.forEach(obj => {
    const { name, subFields } = obj;
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
    console.log("customfield obj:", obj);

    const { name, value } = obj;
    if (Array.isArray(value)) {
      deal[name] = (value || []).map(item => {
        const replaced = {
          ...item,
          value: replacePlaceholders(item.value, orderData)
        };
        if (typeof replaced.value === "string") {
          replaced.value = replaced.value.replace(
            /\b(\d{4})-(\d{2})-(\d{2})(?:\s+\d{2}:\d{2}:\d{2})?\b/g,
            (_, y, m, d) => `${y}/${m}/${d}`
          );
        }
        if (item.type === 'picklist' && Array.isArray(item.options)) {
          const actualValue = replaced.value;
          const matchedOption = item.options.find(opt => {
            const small = replacePlaceholders(opt.smallvalue || '', orderData);
            return small === actualValue;
          });
          if (matchedOption) {
            replaced.value = matchedOption.optionId ?? matchedOption.option;
          }
          return {
            id: item.id,
            value: replaced.value
          };
        }
        return replaced;
      });
    }
  });


  if (
    Array.isArray(deal.order_products) &&
    deal.order_products.some(p => p.sku === "")
  ) {
    delete deal.order_products;
  }

  const datedeal = convertDateInStringValues(deal)
  const cleanedDeal = cleanEmptyValues(datedeal);
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
  // console.log("Final cleaned deal", cleanedDeal);
  return cleanedDeal;
}