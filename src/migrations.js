
module.exports = function(app,client){
    app.get("/init", async(req, res) => {
        let query = 'CREATE TABLE bounties (issue Text, bounty_amount real, Github Text);'

        let response = await client.query(query);
        res.send(response)
    })
    app.get("/destory", async(req, res) => {
        let query = 'DROP TABLE bounties';
        let response = await client.query(query);
        res.send(response)
    })
}