import { promises as fs } from 'fs';
import path from 'path';

export async function readCondition() {
    const filePath = path.join(process.cwd(), 'data', 'condition.json');
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const json = JSON.parse(fileContent);
        return json;
    } catch (error) {
        console.error('❌ Failed to read or parse condition.json:', error);
        return null;
    }
}

export async function writeCondition(data) {
    const filePath = path.join(process.cwd(), 'data', 'condition.json');
    try {
        await fs.mkdir(path.dirname(filePath), { recursive: true }); // đảm bảo thư mục tồn tại
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('❌ Failed to write file:', error);
        return false;
    }
}

export async function saveConfig(configArray) {
    try {
        const configPath = path.join(process.cwd(), 'data', 'config.json'); // file config nằm cùng folder với condition.json
        const jsonString = JSON.stringify(configArray, null, 2); // format đẹp, 2 space indent

        await fs.writeFile(configPath, jsonString, 'utf-8');
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to save config:', error);
        return { success: false, error };
    }
}

export function readDefaultConfig() {
    return [
        {
            "name": "username",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "subject",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "phone",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "email",
            "type": "email",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "service_id",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "group_id",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "assignee_id",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "pipeline_id",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "campaign_id",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "estimated_closed_date",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "deal_label",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "pipeline_stage_id",
            "type": "int",
            "typeInput": "pipeline_stage",
            "value": []
        },
        {
            "name": "custom_fields",
            "type": "array",
            "typeInput": "custom",
            "value": []
        },
        {
            "name": "probability",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "value",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "comment",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "comment.body",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "comment.is_public",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "comment.author_id",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "order_address_detail",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "order_buyer_note",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "order_city_id",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "order_district_id",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "order_ward_id",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "order_receiver_name",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "order_receiver_phone",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "order_status",
            "type": "int",
            "typeInput": "status",
            "value": [
                {
                    "status": "ORDER_STARTED",
                    "value": ""
                },
                {
                    "status": "BUYER_CONFIRMED",
                    "value": ""
                },
                {
                    "status": "SELLER_CONFIRMED",
                    "value": ""
                },
                {
                    "status": "SHIPPING",
                    "value": ""
                },
                {
                    "status": "RETURNED",
                    "value": ""
                },
                {
                    "status": "CANCELED",
                    "value": ""
                },
                {
                    "status": "RECEIVED",
                    "value": ""
                },
                {
                    "status": "COMPLETED",
                    "value": ""
                }
            ]
        },
        {
            "name": "order_tracking_code",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "order_tracking_url",
            "type": "int",
            "typeInput": "normal",
            "value": ""
        },
        {
            "name": "order_products",
            "type": "int",
            "typeInput": "product",
            "value": "",
            "subFields": [
                {
                    "name": "sku",
                    "type": "string",
                    "typeInput": "normal",
                    "value": ""
                },
                {
                    "name": "is_free",
                    "type": "int",
                    "typeInput": "normal"
                },
                {
                    "name": "unit_price",
                    "type": "float",
                    "typeInput": "normal",
                    "value": ""
                },
                {
                    "name": "quantity",
                    "type": "int",
                    "typeInput": "normal",
                    "value": ""
                },
                {
                    "name": "discount_markup",
                    "type": "float",
                    "typeInput": "normal",
                    "value": ""
                },
                {
                    "name": "discount_value",
                    "type": "float",
                    "typeInput": "normal",
                    "value": ""
                }
            ]
        }
    ]
}
