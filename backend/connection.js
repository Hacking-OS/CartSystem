const mysql = require("mysql");

const myConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "admin",
    database: "mydb"
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
