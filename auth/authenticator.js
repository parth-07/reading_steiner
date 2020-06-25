const crypto = require('crypto');
const e = require('express');
const { send } = require('process');
let userDB;

function transform_validate_data(data, requiredParams = [],cbFunc) {
    err = null;
    if ('password' in data) {
        data['password'] = crypto.createHash('sha256').update(password).digest('hex');
    }
    if ('email' in data) {
        if (!validator.isEmail(data['email'])) {
            err = new Error("invalid email");
            err.code = 1;
        }
    }
    for(let i = 0 ;!e && i < requiredParams.length ; ++i) {
        if(!(requiredParams[i] in data)) {
            err = new Error(requiredParams[i] + " not present");
            err.code = 2;
        }
    }
    cbFunc(err,data)
}

function create_account(req,res) {
    data = req.body;
    let requiredParams = ['username','password','email'];
    userDB.get_user(data , (err,userRow) => {
        if(err || userRow) {
            message = err ? "Something went wrong " : "User already exists";
            sendResponse(res,err,message);
            return 1;
        }
        
        transform_validate_data(data,requiredParams,(err,bio_data) => {
            if(err) {
                message = "One or more required parameters missing";
                sendResponse(res,err,message);
                return 2;
            }
            userDB.create_account(bio_data,(err,res_query) => {
                message = (err ? "Something went wrong" : "Success");
                sendResponse(res,err,message); 
            })
            return 0;
        })
    })
}

function login(req,res) {
    data = req.body;
    let requiredParams = ['username','password'];
    userDB.get_user(data,(err,resRow) => {
        if(err) {
            message = "Something went wrong";
            sendResponse(res,err,message);
            return 1;
        }
        transform_validate_data(data,(err,bio_data) => {
            if(err) {
                message = "Something went wrong";
                sendResponse(res,err,message);
            }
            is_successful = resRow['password'] == bio_data['password'];
            message = (is_successful ? "Success !" : "Incorrect Password" );
            if(! is_successful) {
                err = new Error("Incorrect credentials");
            }
            
        })
    })
}

function sendResponse(res,error,message) {
    res.status(error != undefined ? 400 : 200).json({
        error : error ,
        message : message
    })
}

module.exports = (injectedPgClient) => {
    userDB = injectedPgClient ;
    return {
        create_account : create_account
    }
};