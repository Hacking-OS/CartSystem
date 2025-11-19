const express= require("express");
var cors=require("cors");
const myConnection = require("./connection");
const app = express();
var bodyParser = require('body-parser');


// Put these statements before you define any routes.
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
app.use(express.json());



app.use(cors({
  origin: ['http://localhost:4200','http://localhost:8081'],
  methods: 'GET,POST,DELETE,PATCH,PUT,OPTIONS',
  allowedHeaders: 'Authorization, Content-Type',
  credentials: true, // Allow credentials (cookies, HTTP authentication)
  optionsSuccessStatus: 204, // Respond to preflight requests with a 204 No Content status
}));
// create application/json parser
app.use("/users",require("./routes/user"));
app.use("/category",require("./routes/category"));
app.use("/product",require("./routes/product"));
app.use("/bill",require("./routes/bill"));
app.use("/dashboard",require("./routes/dashboard"));
app.use("/cart",require("./routes/cart"));
app.use("/checkout",require("./routes/checkout"));
app.use("/count",require("./routes/count"));
app.use("/message",require("./routes/messenger"));

module.exports = app;
