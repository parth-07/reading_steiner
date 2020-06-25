module.exports = (router , authenticator) => {
    router.post('/register',authenticator.create_account);
    router.post('/login',authenticator.login);
    return router;
}