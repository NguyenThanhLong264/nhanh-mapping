// src/app/api/bill/sync/route.js
import path from 'path';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import { nextSyncDate } from '@/app/lib/cron-ultils/calcTime';

const filePath = path.join(process.cwd(), 'data', 'sync-mode.json');

// GET: Chỉ trả về { mode }
export async function GET() {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        const mode = data.mode
        const { typeMode = 'interval', minute = 20 } = data;
        const nextRunAt = nextSyncDate(typeMode, minute);

        return NextResponse.json({
            mode,
            minute,
            nextRunAt: nextRunAt.toISOString(),
        });
    } catch (error) {
        console.error("Lỗi khi đọc file:", error);
        return NextResponse.json(
            { error: "Không thể đọc dữ liệu." },
            { status: 500 }
        );
    }
}

// POST: Ghi toàn bộ object (mode, fromDate, toDate)
export async function POST(req) {
    try {
        const body = await req.json();
        const { mode, fromDate, toDate } = body;

        if (!mode) {
            return NextResponse.json({ error: "Thiếu mode" }, { status: 400 });
        }

        const newData = { mode, fromDate, toDate };
        await fs.writeFile(filePath, JSON.stringify(newData, null, 2), 'utf-8');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Lỗi khi ghi file:", error);
        return NextResponse.json({ error: "Không thể ghi dữ liệu." }, { status: 500 });
    }
}
