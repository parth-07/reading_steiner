const crypto = require('crypto');
const validator = require('validator');

function transform_validate_data(data, requiredParams, notRequiredParams, cbFunc = null ) {
    err = null;
    if ('password' in data) {
        data['password'] = crypto.createHash('sha256').update(data['password']).digest('hex');
    }
    if ('email' in data) {
        if (!validator.isEmail(data['email'])) {
            err = new Error("Invalid email");
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
    if(err) {
        err.validationError = true;
    }
    if (cbFunc)
        return cbFunc(err,data);
    else 
        return [err, data];
}

module.exports = {
    transform_validate_data : transform_validate_data
};