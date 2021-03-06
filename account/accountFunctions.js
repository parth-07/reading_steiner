let userDB;
let tokenDB
let questionDB;
const utility = require('../utility');

function user_info(req,res,next) {
    data = req.body;
    userDB.get_user_db(data,(err , user) => {
        if(err) {
            err = new Error("Invalid user");
            err.status_code = 401 ;
            return err;
        }
        else {
            res.json(user);
        }
    })
}

function log_off(req,res,next) {
    data = req.body;
    tokenDB.remove_user_tokens(data , (err,res_query) => {
        if(err) {
            err.status_code = 401;
            return next(err);
        }
        else {
            res.status(200).send('Success')
        }
    })
}

function cal_world_line(divNum) {
    WORLD_LINES = ['omega','gamma','beta','alpha','steins_gate'];
    divNum = Math.floor(divNum);
    return WORLD_LINES[divNum];

}

function get_questions(req,res,next) {
    console.log("in get_questions");
    questionDB.get_questions((err , questions) => {
        if(err) {
            err.status_code = 500 ;
            next(err);
        }
        res.json({'error' : null , 'questions' : questions});
    })
}

function update_progress(req,res,next) {
    console.log("in update_progress");
    data = req.body;
    requiredParams = ['divergence_number'];
    [err,data] = utility.transform_validate_data(data,requiredParams,[]);
    if(err) {
        err.status_code = 400;
        return next(err);
    }
    userDB.progress_updated_today(data,(err , update_status) => {
        if(err) {
            err.status_code = 500;
            return next(err);
        }
        else if(update_status) {
            err = new Error("Progress can be updated only once a day");
            err.status_code = 406 ;
            return next(err);
        }
        else {
            userDB.update_progress_db(data,(err , res_query) => {
                if(err) {
                    err.status_code = 500;
                    return next(err);
                }
                else {
                    res.status(200).send('Success');
                }
            })
        }
    })
}

function progress_updated(req,res,next) {
    console.log("in progress_updated");
    data = req.body;
    userDB.progress_updated_today(data ,(err,update_status) => {
        if(err) {
            err.status_code = 500;
            return next(err);
        }
        res.json({ "progress_updated" : update_status});
    })
}

module.exports = (injectedUserDBClient , injectedTokenDBClient , injectedQuestionDBClient) => {
    userDB = injectedUserDBClient;
    tokenDB = injectedTokenDBClient;
    questionDB = injectedQuestionDBClient
    return {
        user_info : user_info,
        log_off : log_off,
        get_questions : get_questions,
        update_progress : update_progress,
        progress_updated : progress_updated
    }
}