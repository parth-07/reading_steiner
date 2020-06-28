let pgClient;

function get_questions(cbFunc) {
    queryText = "SELECT * FROM questions";
    pgClient.query(queryText,[],(err,res_query)=> {
        console.log("error : ",err);
        if(! err) {
            res_query = res_query.rows;
        }
        cbFunc(err,res_query);
    })
}

module.exports = (injectedPgClient) => {
    pgClient = injectedPgClient;
    return {
        get_questions : get_questions
    }
}