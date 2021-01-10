const express = require('express')
const app = express()
const { Client } = require('node-postgres');

const port = 8080

async function start() {
    const client = new Client({
        user: 'username',
        host: 'database',
        database: 'postgres',
        password: 'password',
        port: 5432
    });

    await client.connect()

    app.get("/issue/:org/:repo/issues/:issue_id", (req, res) => {
        res.send(req.params);
    });

    app.get('/', (req, res) => {
        res.send('Welcome to the <a href="https://git.bid">git.bid</a> api!')
    })

    app.get('/status', (req, res) => {
        res.send("Operational🚀");
    })

    app.listen(port, () => {
        console.log(`Git.bid API listening at http://localhost:${port}`)
    })
    app.post("/post/bounty", (req, res) => {
        let json = JSON.parse(req.body);
        res.send(json)
    });

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

start()