const express = require('express');
const bodyParser = require('body-parser');
const pgClient = require('./db/pgWrapper');
const userDB = require('./db/userDB')(pgClient);
const authenticator = require('authenticator')(userDB);
const authRoutes = require('./auth/authRoutes');

const PORT = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

let authRouter = authRoutes(express.Router(),authenticator);

app.use('/auth',authRouter);

app.listen(PORT)