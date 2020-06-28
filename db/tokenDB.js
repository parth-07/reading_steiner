const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;
let pgClient;


function decode_access_token(token, cbFunc = null) {
    if (cbFunc) {
        jwt.verify(token, SECRET, (err, decoded) => {
            cbFunc(err, decoded);
        });
    }
    else {
        return jwt.verify(token,SECRET);
    }
}

function get_access_token(data, cbFunc) {
    console.log("in get_access_token");
    token = jwt.sign(data, SECRET, (err, token) => {
        cbFunc(err, token);
    });
}

function add_access_token(data, cbFunc) {
    console.log("in add_access_token");
    queryText = "INSERT INTO access_tokens(userid,access_token) VALUES ($1 , $2) ";
    queryValues = [data['userid'], data['token']];
    pgClient.query(queryText, queryValues, (err, res_query) => {
        cbFunc(err, res_query);
    })
}

function remove_user_tokens(data, cbFunc) {
    console.log("in remove_user_tokens ", data['userid']);
    queryText = "DELETE FROM access_tokens WHERE userid = $1";
    queryValues = [data['userid']];
    pgClient.query(queryText, queryValues, (err, res_query) => {
        // console.log(res_query);
        cbFunc(err, res_query);
    });
}

module.exports = (injectedPgClient) => {
    pgClient = injectedPgClient;
    return {
        get_access_token: get_access_token,
        add_access_token: add_access_token,
        remove_user_tokens: remove_user_tokens,
        decode_access_token: decode_access_token
    }
};