const express = require('express');
const bodyParser = require('body-parser');
const pgClient = require('./db/pgWrapper');
const userDB = require('./db/userDB')(pgClient);
const tokenDB = require('./db/tokenDB')(pgClient);
const authenticator = require('./auth/authenticator')(userDB,tokenDB);
const accountFunctions = require('./account/accountFunctions')(userDB,tokenDB);
const authRoutes = require('./auth/authRoutes');
const accountRoutes = require('./account/accountRoutes.js');

const PORT = process.env.PORT || 3000;

var app = express();

let authRouter = authRoutes(authenticator);
let accountRouter = accountRoutes(authenticator,accountFunctions);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use('/account',accountRouter);
app.use('/auth',authRouter);

app.get('/',(req,res) => {
    res.send('Hello World');
    console.log("Hello World");
})

app.listen(PORT , () => {
    console.log("Listening at port : ",PORT);
})