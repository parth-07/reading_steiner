const express = require('express');


module.exports = (authenticator) => {
    router = express.Router();
    router.post('/register',authenticator.create_account);
    router.post('/login',authenticator.login);
    return router;
}