const express = require('express');


module.exports = (authenticator,accountFunctions) => {
    accountRouter = express.Router();
    accountRouter.use(authenticator.verifyToken);

    accountRouter.post('/profile',accountFunctions.user_info);
    accountRouter.post('/signoff',accountFunctions.log_off);
    accountRouter.post('/getquestions',accountFunctions.get_questions);
    accountRouter.post('/updateProgress',accountFunctions.update_progress);
    accountRouter.use((err,req,res,next) => {
        if(res.headersSent) {
            return next(err);
        }
        console.log(err.message);
        res.status(err.status_code || 404).json({
            error : err.message 
        })
    })
    return accountRouter;
}