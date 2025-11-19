const mysql = require("mysql");
const config = require("./config");

const myConnection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    port: config.database.port
});
myConnection.connect((err) => {
    (err) ? console.log("error:" + err): console.log("Connected");
});

// const io = require("socket.io")(3000);
// io.on('connection',socket=>{
//   console.log("Connected To Socket!");
//   socket.emit('chat-message',"Hello World");
// });
module.exports = myConnection;
