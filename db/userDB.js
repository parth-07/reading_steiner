const { query } = require("express");

let pgClient;

function create_account_db(bioData, cbFunc) {
    console.log("in userDB create_account");
    console.log(bioData);
    queryText = "INSERT INTO users(username,password,email,first_name,last_name) VALUES ($1 , $2 , $3 , $4 , $5)";
    queryValues = [bioData['username'], bioData['password'], bioData['email'], bioData['first_name'], bioData['last_name']];

    pgClient.query(queryText, queryValues, (err, res) => {
        cbFunc(err, res);
    })
}

function get_user_db(data, cbFunc) {
    if ('userid' in data) {
        queryText = "SELECT * FROM users WHERE userid = $1";
        queryValues = [data['userid']];
    }
    else if ('username' in data) {
        queryText = "SELECT * FROM users WHERE username = $1";
        queryValues = [data['username']];
    }
    else {
        cbFunc(new Error("No identifier found for get_user"), null);
        return 1;
    }
    pgClient.query(queryText, queryValues, (err, res) => {
        if (!err) {
            res = (res.rows.length == 1) ? res.rows[0] : null;
        }
        cbFunc(err, res);
    })
    return 0;
}


function update_progress_db(data, cbFunc) {
    queryText = "INSERT INTO progress(divergence_number) VALUES($1)";
    queryValues = data['divergence_number'];
    pgClient.query(queryText, queryValues, (err, res_query) => {
        if (!err) {
            queryText = "UPDATE users SET divergence_number = $1 , worldline = $2 WHERE userid = $3"
            queryValues = [data['divergence_number'], data['worldline'], data['userid']]
            pgClient.query(queryText, queryText, (err, res_query) => {
                cbFunc(err , res_query);
            })
        }
        else {
            cbFunc(err,res_query)
        }
    })
}

function get_latest_progress_record(data,cbFunc) {
    queryText = "SELECT * FROM progress WHERE userid = $1 ORDER BY progress_date DESC LIMIT 1";
    queryValues = [data['userid']];
    pgClient.query(queryText,queryValues,(err,res_query) => {
        if(! err) {
            if(res_query.rows.length)
                res_query = res_query.rows[0];
            else
                res_query = null;
            cbFunc(err,res_query);
        }
        else {
            cbFunc(err,res_query);
        }
    })
}

module.exports = (injectedPgClient) => {
    pgClient = injectedPgClient;

    return {
        create_account_db: create_account_db,
        get_user_db : get_user_db,
        update_progress_db : update_progress_db,
        get_latest_progress_record : get_latest_progress_record
    }
};
