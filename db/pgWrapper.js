const Client = require('pg').Client;


let client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

function query(queryText, queryValues, cbFunc) {
    if(queryValues.length) {
        client.query(queryText, queryValues, (err, res) => {
            cbFunc(err, res);
        })
    }
    else {
        client.query(queryText,(err,res) => {
            cbFunc(err,res);
        })
    }
}

module.exports = {
    query: query
};