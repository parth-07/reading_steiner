const express = require('express');
const bodyParser = require('body-parser');
const Client = require('pg').Client;
const PORT = process.env.PORT || 3000;
const validator = require('validator');

var client = new Client({
    connectionString : process.env.DATABASE_URL,
    ssl : {
        rejectUnauthorized : false
    }
});

client.connect();

var app = express();


app.get('/',(req,res,next) => {
    res.send("Hello World");
    next()
});

app.listen(PORT)