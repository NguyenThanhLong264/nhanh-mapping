import { getConditionByName } from "@/app/lib/db";
import { readCondition } from "@/app/lib/handlers/readJSON";

// app/api/custom_fields/route.js
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const customFieldId = searchParams.get('custom_field_id');

    if (!customFieldId) {
        return new Response(JSON.stringify({ error: true, message: 'Missing custom_field_id' }), {
            status: 400,
        });
    }
    let token;
    if (process.env.DB_TYPE === 'mysql') {
        token = await getConditionByName("apiKey")
    } else if (process.env.DB_TYPE === 'sqlite') {
        const condition = await readCondition();
        token = condition;
    }
    try {
        const response = await fetch(
            `https://api.caresoft.vn/${token.CareSoft_Domain}/api/v1/tickets/custom_fields`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.CareSoft_ApiToken}`,
                },
            }
        );
        if (!response.ok) {
            const errorText = await response.text();
            return new Response(JSON.stringify({ error: true, message: errorText }), { status: response.status });
        }
        const result = await response.json();

        const matchedField = result?.custom_fields?.find(
            (field) => String(field.custom_field_id) === customFieldId
        );

        if (!matchedField) {
            return new Response(JSON.stringify({
                error: true,
                message: `custom_field_id ${customFieldId} not found`,
            }), {
                status: 404,
            });
        }

        const idArray = matchedField.values?.map((v) => v.id) || [];

        return new Response(JSON.stringify(idArray), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: true, message: err.message }), {
            status: 500,
        });
    }
}
