const express = require('express');
const bodyParser = require('body-parser');
const pgClient = require('./db/pgWrapper');
const userDB = require('./db/userDB')(pgClient);
const tokenDB = require('./db/tokenDB')(pgClient);
const questionDB = require('./db/questionDB')(pgClient);
const authenticator = require('./auth/authenticator')(userDB,tokenDB);
const accountFunctions = require('./account/accountFunctions')(userDB,tokenDB,questionDB);
const authRoutes = require('./auth/authRoutes');
const accountRoutes = require('./account/accountRoutes.js');


const PORT = process.env.PORT || 4000;

var app = express();

let authRouter = authRoutes(authenticator);
let accountRouter = accountRoutes(authenticator,accountFunctions);

app.engine('view engine', require('pug').renderFile)

app.use(express.static('views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use('/account',accountRouter);
app.use('/auth',authRouter);

app.get('/',(req,res) => {
    console.log("Hello World");
    // res.send("Hello World");
    res.redirect(302,'./index.html');
})
app.get('/questions',(req,res) => {
    questionDB.get_questions((err,questions) => {
        if(err) {
            console.log(err);
            res.json(err);
        }
        else {
            console.log(questions);
            res.json(questions);
        }
    });
})

app.listen(PORT , () => {
    console.log("Listening at port : ",PORT);
})