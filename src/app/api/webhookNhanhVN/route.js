import { NextResponse } from 'next/server';
import { webhookDispatcher } from '../../lib/handlers/webhookDispatcher';
import { getConditionByName } from '@/app/lib/db';
import { readCondition } from '@/app/lib/handlers/readJSON';

export async function POST(request) {
    let token;
    if (process.env.DB_TYPE === 'mysql') {
        token = await getConditionByName("apiKey")
    } else if (process.env.DB_TYPE === 'sqlite') {
        const condition = await readCondition();
        token = condition;
    }
    // console.log("Token:", token);

    try {
        const body = await request.json();
        const event = body.event;
        const webhooksVerifyToken = body.webhooksVerifyToken;

        if (!event) {
            console.log('Missing event type');
            return NextResponse.json({ message: 'Missing event type' }, { status: 400 });
        } else if (!webhooksVerifyToken) {
            console.log('Missing webhooksVerifyToken');
            return NextResponse.json({ message: 'Missing webhooksVerifyToken' }, { status: 400 });
        } else if (webhooksVerifyToken !== token.NhanhVN_VerifyToken) {
            console.log('WebhooksVerifyToken not match.Received:', webhooksVerifyToken, 'Expected:', token.NhanhVN_VerifyToken);
            return NextResponse.json({ message: 'Invalid webhooksVerifyToken' }, { status: 400 });
        }

        await webhookDispatcher(event, body);
        return NextResponse.json({ message: 'Received successfully' }, { status: 200 });
    } catch (error) {
        console.error('Webhook - Error:', error.message);
        return NextResponse.json(
            { message: 'Webhook processing failed', error: error.message },
            { status: 500 }
        );
    }
}
