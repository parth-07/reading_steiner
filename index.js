const express = require('express');
const bodyParser = require('body-parser');
const pgClient = require('./db/pgWrapper');
const userDB = require('./db/userDB')(pgClient);
const tokenDB = require('./db/tokenDB')(pgClient);
const authenticator = require('./auth/authenticator')(userDB,tokenDB);
const authRoutes = require('./auth/authRoutes');

const PORT = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

let authRouter = authRoutes(authenticator);

app.use('/auth',authRouter);

app.get('/',(req,res) => {
    res.send('Hello World');
})

app.listen(PORT , () => {
    console.log("Listening at port : ",PORT);
})