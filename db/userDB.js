let pgClient;
const crypto = require('crypto');
const validator = require('validator');

function create_account(data, cbFunc) {
    queryText = "INSERT INTO users(username,password,email,first_name,last_name) VALUES ($1 , $2 , $3 , $4 , $5)";
    queryValues = [data['username'], data['password'], data['email'], data['first_name'], data['last_name']];

    pgClient.query(queryText, queryValues, (err, res) => {
        cbFunc(err, res);
    })
}

function get_user(data, cbFunc) {
    if ('userid' in data) {
        queryText = "SELECT * FROM users WHERE userid = $1";
        queryValues = [data['userid']];
    }
    else if ('username' in data) {
        queryText = "SELECT * FROM users WHERE username = $1";
        queryValues = [data['username']];
    }
    else {
        cbFunc(new Error("No identifier found for get_user"),null); 
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


module.exports = (injectedPgClient) => {
    pgClient = injectedPgClient;

    return {
        create_account: create_account,
        get_user: get_user
    }
};