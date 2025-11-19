const http = require("http");
const app =require("./index");
const config = require("./config");
const server = http.createServer(app);
const enviroment = require("../client/src/environments/enviroment");

const host = config.app.host || enviroment.baseUrl || "0.0.0.0";
const port = config.app.port;

console.log(`Attempting to start server on ${host}:${port}`);

server.listen(port, host, () => {
    console.log(`The server is running on http://${host}:${port}`);
});
