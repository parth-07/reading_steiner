const crypto = require('crypto');
const validator = require('validator');
const utility = require('../utility');
let userDB, tokenDB;



function create_account(req, res) {
    console.log('in create_account');
    data = req.body;
    let requiredParams = ['username', 'password', 'email'];
    let notRequiredParams = ['first_name', 'last_name'];
    userDB.get_user_db(data, (err, userRow) => {
        if (err || userRow) {
            console.log(err, userRow);
            message = err ? "Something went wrong " : "User already exists , Choose different username ";
            if(! err ) {
                err = new Error("User already exists");
                err.validationError = true;
            }
            sendResponse(res, err, message);
            return 1;
        }

        utility.transform_validate_data(data, requiredParams, notRequiredParams, (err, bioData) => {
            if (err) {
                message = "One or more required parameters missing or have invalid value";
                sendResponse(res, err, message);
                return 2;
            }
            userDB.create_account_db(bioData, (err, res_query) => {
                message = (err ? "Something went wrong" : "Success");
                sendResponse(res, err, message);
            })
            return 0;
        })
    })
}

function login(req, res) {
    console.log("in login");
    data = req.body;
    let requiredParams = ['username', 'password'];
    userDB.get_user_db(data, (err, resRow) => {
        if (err || !resRow) {
            message = (err ? "Something went wrong" : "User does not exist");
            err = (err ? err : new Error("Invalid User"));
            sendResponse(res, err, message);
            return 1;
        }
        data['userid'] = resRow['userid'];
        console.log("userid =",data['userid']);
        utility.transform_validate_data(data, [], [], (err, bioData) => {
            if (err) {
                message = "Something went wrong";
                sendResponse(res, err, message);
                return 2;
            }
            is_successful = resRow['password'] == bioData['password'];
            message = (is_successful ? "Success !" : "Incorrect Password");
            console.log("is_successful =", is_successful);
            if (!is_successful) {
                // console.log("soka");
                err = new Error("Incorrect credentials");
                err.validationError = true;
                sendResponse(res,err,message);
                // console.log(err);
            }
            else {
                delete data['password'];
                tokenDB.remove_user_tokens(data, (err, res_query) => {
                    if (err) {
                        message = "Something went wrong ";
                        sendResponse(res,err,message);
                    }
                    else {
                        tokenDB.get_access_token(data, (err, token) => {
                            if (err) {
                                message = "Something went wrong while getting access token";
                                sendResponse(res,err,message);
                            }
                            else {
                                data['token'] = token;
                                tokenDB.add_access_token(data, (err, res_add_query) => {
                                    if (err) {
                                        // console.log("not so good i guess ", err);
                                        message = "Something went wrong while adding access token";
                                        sendResponse(res,err,message);
                                    }
                                    else {
                                        // console.log("seems good so far");
                                        res.status(200).json({ token_type : 'Bearer', access_token: token });
                                    }
                                })
                            }
                        })
                    }
                })
            }

        })
    })
}


function log_off(req,res) {
    
}

function verifyToken(req,res,next) {
    console.log("In verifyToken")
    token = req.get('access_token') || null ;
    if(token == null ) {
        err = new Error("Login to access this page");
        err.status_code = 401;
        return next(err);
    }
    else {
        userid = null;
        tokenDB.decode_access_token(token , (err,decoded) => {
            if(err) {
                err.status_code = 401;
                next(err);
            }
            userid = decoded['userid'];
        })
        if(! userid) {
            err = new Error("Invalid access token");
            err.status_code = 401;
            return next(err);
        }
        req.body['userid'] = userid;
        next();
    }
}

function sendResponse(res, error, message) {
    console.log(error);
    res.status(error != undefined ? 400 : 200).json({
        error: (error ? error.message : null),
        message: message,
        type : ((error && error.validationError) ? 'validation' : 'other')
    })
}



module.exports = (injectedUserDBClient, injectedTokenDBClient) => {
    userDB = injectedUserDBClient;
    tokenDB = injectedTokenDBClient
    return {
        create_account: create_account,
        login: login,
        verifyToken : verifyToken
    }
};