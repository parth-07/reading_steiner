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

let query = "SELECT * FROM just_test"

app.get('/',(req,res,next) => {
    client.query(query,(response) => {
        res.send(response.results);
        next()
    });
});

app.listen(PORT)