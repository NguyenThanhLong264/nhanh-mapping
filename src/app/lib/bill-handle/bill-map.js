import { convertDateInStringValues } from "../handlers/handerCustomFields.js";
import { configClassify, replacePlaceholders } from "../services/webhookUtils.js";
import { loadBillConfig } from "./bill-config.js";

export async function mapBilltoDeal(data) {
    const config = await loadBillConfig();
    // console.log('[DEBUG] config loaded:', config);
    const { normal, special, product, custom } = configClassify(config);
    const deal = {};

    normal.forEach(obj => {
        const { name, typeInput, value } = obj;
        if (typeInput === "normal") {
            deal[name] = replacePlaceholders(value, data);
        } else if (typeInput === "map") {
            deal[name] = data[value];
        }
    });

    special.forEach(obj => {
        const { name, typeInput, value } = obj;
        if (typeInput === "pipeline_stage") {
            const matchedStage = value.find(stage => stage.value === data.status);
            deal[name] = matchedStage ? matchedStage.id : "";
        } else if (typeInput === "status") {
            const matchedStatus = value.find(status => status.value === data.status);
            deal[name] = matchedStatus ? matchedStatus.status : "ORDER_STARTED";
        }
    });

    product.forEach(obj => {
        const { name, subFields } = obj;
        const productList = Object.values(data.products || {});

        deal[name] = productList.map(product => {
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
        // console.log("customfield obj:", obj);
        const { name, value } = obj;
        if (Array.isArray(value)) {
            deal[name] = (value || []).map(item => {
                const replaced = {
                    ...item,
                    value: replacePlaceholders(item.value, data)
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
                        const small = replacePlaceholders(opt.smallvalue || '', data);
                        return small === actualValue;
                    });
                    if (!matchedOption) {
                        return { id: item.id, value: '' };
                    }
                    replaced.value = matchedOption.optionId ?? matchedOption.option;
                    return {
                        id: item.id,
                        value: replaced.value
                    };
                }
                return replaced;
            }).filter(item => item.value !== '');
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
    console.log("Final cleaned bill", cleanedDeal);
    return cleanedDeal;
}

function cleanEmptyValues(obj, exceptions = ["username", "phone", "email"]) {
    const normalizedObj = Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
            let newValue = value === null ? "" : value;
            if (exceptions.includes(key) && (newValue === "" || newValue === undefined)) {
                newValue = "";
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
