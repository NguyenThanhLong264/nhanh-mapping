// server.js
const https = require("https");
const fs = require("fs");
const next = require("next");

const port = 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Load SSL cert
const httpsOptions = {
    key: fs.readFileSync("./cert/key.pem"),
    cert: fs.readFileSync("./cert/cert.pem"),
};

app.prepare().then(() => {
    https.createServer(httpsOptions, (req, res) => {
        handle(req, res);
    }).listen(port, () => {
        console.log(`✅ HTTPS server is running at https://ngoinhachungsavani.com:${port}`);
    });
});
