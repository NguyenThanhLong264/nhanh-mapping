import fs from "fs";
import path from "path";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const checkKey = searchParams.get("checkKey");

    // Bảo vệ bằng khóa truy cập
    if (checkKey !== "12345678") {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const dir = path.join(process.cwd(), "data");
        const filePath = path.join(dir, "check.txt");
        const now = new Date();
        const vnTime = now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });

        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, "✅ File được ghi lúc: " + vnTime);

        const content = fs.readFileSync(filePath, "utf8");

        return Response.json({
            success: true,
            message: "Ghi và đọc file thành công.",
            content,
            pathUsed: filePath,
            cwd: process.cwd(),
        });
    } catch (err) {
        return Response.json({
            success: false,
            error: err.message,
            cwd: process.cwd(),
        }, { status: 500 });
    }
}
