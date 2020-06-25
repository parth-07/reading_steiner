const Client = require('pg').Client;


function query(queryText, queryValues, cbFunc) {
    let client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    client.connect();
    client.query(queryText, queryValues, (err, res) => {
        cbFunc(err, res);
        client.end();
    })
}

module.exports = {
    query: query
};