// server.js
import https from "https";
import fs from "fs";
import next from "next";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { spawn } from "child_process";

// Setup __dirname cho ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Load SSL cert
const httpsOptions = {
    key: fs.readFileSync(join(__dirname, "cert", "key.pem")),
    cert: fs.readFileSync(join(__dirname, "cert", "cert.pem")),
};

app.prepare().then(() => {
    // Chạy server
    https.createServer(httpsOptions, (req, res) => {
        handle(req, res);
    }).listen(port, () => {
        console.log(`✅ HTTPS server is running at https://ngoinhachungsavani.com:${port}`);
    });

    const cronProcess = spawn("node", [join(__dirname, "cron-runner.js")], {
        stdio: "inherit", // để log hiển thị cùng
    });

    cronProcess.on("exit", (code) => {
        console.warn(`⚠️ cron-runner.js exited with code ${code}`);
        // Có thể restart sau vài giây nếu muốn:
        // setTimeout(() => startCron(), 5000);
    });
});