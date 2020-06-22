const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

app = express();

app.get('/',(req,res,next) => {
    res.send("Hello World");
    next()
});

app.listen(PORT)