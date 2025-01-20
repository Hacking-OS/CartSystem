require('dotenv').config();
const http = require("http");
const app =require("./index");
const server = http.createServer(app);
const port = process.env.PORT;
const os = require("node:os");
const enviroment = require("../client/src/environments/enviroment");
const ip=enviroment.baseUrl;
console.log(port,ip);
server.listen(port,ip, () => {
    console.log(`The server is running on http://${ip}:${port}`);
});
