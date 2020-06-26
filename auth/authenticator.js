const crypto = require('crypto');
const validator = require('validator');
const { send } = require('process');
let userDB, tokenDB;

function transform_validate_data(data, requiredParams, notRequiredParams, cbFunc) {
    err = null;
    if ('password' in data) {
        data['password'] = crypto.createHash('sha256').update(data['password']).digest('hex');
    }
    if ('email' in data) {
        if (!validator.isEmail(data['email'])) {
            err = new Error("invalid email");
            err.code = 1;
        }
    }
    for (let i = 0; !err && i < requiredParams.length; ++i) {
        if (!(requiredParams[i] in data)) {
            err = new Error(requiredParams[i] + " not present");
            err.code = 2;
        }
    }
    for (let i = 0; i < notRequiredParams.length; ++i) {
        key = notRequiredParams[i];
        data[key] = (data[key] ? data[key] : null);
    }
    cbFunc(err, data)
}

function create_account(req, res) {
    console.log('in create_account');
    data = req.body;
    let requiredParams = ['username', 'password', 'email'];
    let notRequiredParams = ['first_name', 'last_name'];
    userDB.get_user(data, (err, userRow) => {
        if (err || userRow) {
            console.log(err, userRow);
            message = err ? "Something went wrong " : "User already exists";
            sendResponse(res, err, message);
            return 1;
        }

        transform_validate_data(data, requiredParams, notRequiredParams, (err, bioData) => {
            if (err) {
                message = "One or more required parameters missing or have invalid value";
                sendResponse(res, err, message);
                return 2;
            }
            userDB.create_account(bioData, (err, res_query) => {
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
    userDB.get_user(data, (err, resRow) => {
        if (err || !resRow) {
            message = (err ? "Something went wrong" : "User does not exist");
            sendResponse(res, err, message);
            return 1;
        }
        data['userid'] = resRow['userid'];
        console.log("userid =",data['userid']);
        transform_validate_data(data, [], [], (err, bioData) => {
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
                                        console.log("not so good i guess ", err);
                                        message = "Something went wrong while adding access token";
                                        sendResponse(res,err,message);
                                    }
                                    else {
                                        console.log("seems good so far");
                                        res.json({ access_token: token });
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


function sendResponse(res, error, message) {
    console.log(error);
    res.status(error != undefined ? 400 : 200).json({
        error: (error ? error.message : null),
        message: message
    })
}

module.exports = (injectedUserDBClient, injectedTokenDBClient) => {
    userDB = injectedUserDBClient;
    tokenDB = injectedTokenDBClient
    return {
        create_account: create_account,
        login: login
    }
};