import fs from 'fs/promises';
import path from 'path';
import { getConditionByName } from '../db';

export async function loadConfig() {
    if (process.env.DB_TYPE === 'mysql') {
        return await getConditionByName("config")
    }
    else if (process.env.DB_TYPE === 'sqlite') {
        const configPath = path.join(process.cwd(), 'src', 'app', 'data', 'config.json');
        try {
            const configData = await fs.readFile(configPath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.log('Webhook - No config found, returning empty array');
            return [];
        }
    }
}

export function replacePlaceholders(template, data) {
    if (typeof template !== 'string') return template;

    // Xử lý đặc biệt cho products
    if (template.includes('{{products}}') && data.products && Array.isArray(data.products)) {
        const productsText = data.products.map(p => {
            return `- ID Nhanh: ${p.id} - SL: ${p.quantity} - KL: ${p.weight}g - Discount: ${p.discount}VND  - Giá: ${p.price}VND`;
        }).join('\n');
        template = template.replace('{{products}}', productsText);
    }

    return template.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        const value = data[param];
        const safeValue = value !== undefined && value !== null ? value : match;
        return safeValue;
    });
}


export function mapOrderStatus(nhanhStatus, config) {
    let statusMapped = false;
    let mappedStatus = 'ORDER_STARTED';
    for (const [key, value] of Object.entries(config.mapping)) {
        if (key.startsWith('order_status.')) {
            const web2Status = key.replace('order_status.', '');
            if (value === nhanhStatus) {
                mappedStatus = web2Status;
                console.log(`Mapped order_status: ${nhanhStatus} -> ${web2Status}`);
                statusMapped = true;
                break;
            }
        }
    }
    if (!statusMapped && nhanhStatus) {
        console.log(`No mapping found for Nhanh.vn status: ${nhanhStatus}, using default: ${mappedStatus}`);
    }
    return mappedStatus;
}

export function mapPipelineStageId(nhanhStatus, config) {
    let idMapped = false;
    let mappedId = '174'; // Default ID
    for (const [key, value] of Object.entries(config.mapping)) {
        if (key.startsWith('pipeline_stage_id.') && key !== 'pipeline_stage_id') {
            const status = key.replace('pipeline_stage_id.', '');
            if (status === nhanhStatus) {
                mappedId = value;
                console.log(`Mapped pipeline_stage_id: ${nhanhStatus} -> ${value}`);
                idMapped = true;
                break;
            }
        }
    }
    if (!idMapped && nhanhStatus) {
        console.log(`No pipeline_stage_id mapping found for Nhanh.vn status: ${nhanhStatus}, using default: ${mappedId}`);
    }
    return mappedId;
}

export function configClassify(config) {
    const normal = config
        .map((row, index) => ({ ...row, originalIndex: index }))
        .filter((row) => row.typeInput === "normal" || row.typeInput === "map");
    const special = config
        .map((row, index) => ({ ...row, originalIndex: index }))
        .filter((row) => row.typeInput === "pipeline_stage" || row.typeInput === "status");
    const product = config
        .map((row, index) => ({ ...row, originalIndex: index }))
        .filter((row) => row.typeInput === "product");
    const custom = config
        .map((row, index) => ({ ...row, originalIndex: index }))
        .filter((row) => row.typeInput === "custom");
    return { normal, special, product, custom };
}