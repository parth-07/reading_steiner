const crypto = require('crypto');
const validator = require('validator');
let userDB;

function transform_validate_data(data, requiredParams,notRequiredParams, cbFunc) {
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
    for(let i = 0; i < notRequiredParams.length ; ++i) {
        key = notRequiredParams[i];
        data[key] = (data[key] ? data[key] : null);
    }
    cbFunc(err, data)
}

function create_account(req, res) {
    console.log('in create_account');
    data = req.body;
    let requiredParams = ['username', 'password', 'email'];
    let notRequiredParams = ['first_name','last_name'];
    userDB.get_user(data, (err, userRow) => {
        if (err || userRow) {
            console.log(err,userRow);
            message = err ? "Something went wrong " : "User already exists";
            sendResponse(res, err, message);
            return 1;
        }

        transform_validate_data(data, requiredParams, notRequiredParams,(err, bioData) => {
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
        if (err) {
            message = "Something went wrong";
            sendResponse(res, err, message);
            return 1;
        }
        transform_validate_data(data,[],[], (err, bioData) => {
            if (err) {
                message = "Something went wrong";
                sendResponse(res, err, message);
            }
            is_successful = resRow['password'] == bioData['password'];
            message = (is_successful ? "Success !" : "Incorrect Password");
            if (!is_successful) {
                // console.log("soka");
                err = new Error("Incorrect credentials");
                // console.log(err);
            }
            sendResponse(res,err,message);
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

module.exports = (injectedPgClient) => {
    userDB = injectedPgClient;
    return {
        create_account: create_account,
        login: login
    }
};