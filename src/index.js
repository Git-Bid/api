const express = require('express')
const app = express()
const cookieSession = require('cookie-session')
const passport = require('passport');
require('./passport')
const isLoggedIn = require('./middleware/auth')


// app.use(cookieSession({
//     name: 'github-auth-session',
//     keys: ['key1', 'key2']
// }))

app.use(passport.initialize());
app.use(passport.session());



const port = 8080

const { Client } = require('node-postgres');
const bodyParser = require('body-parser')


app.use(bodyParser.json());

async function start() {
    const client = new Client({
        user: 'username',
        host: 'database',
        database: 'postgres',
        password: 'password',
        port: 5432
    });

    await client.connect()

    // AUTH
    app.get('/', (req, res) => {
        res.send(`Hello world ${req.user.displayName}`)
    })
    app.get('/auth/error', (req, res) => res.send('Unknown Error'))
    app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
    app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/auth/error' }),
        function(req, res) {
            res.redirect('/');
        });

    app.get('/logout', (req, res) => {
        req.session = null;
        req.logout();
        res.redirect('/');
    })

    app.get('/hello', (req, res) => {
        res.send(`Hello world ${req.user.displayName}`)
    })

    //GET
    app.get("/issue/:org/:repo/issues/:issue_id", (req, res) => {
        res.send(req.params);
    });

    //DEBUG
    // app.get('/', (req, res) => {
    //     res.send('Welcome to the <a href="https://git.bid">git.bid</a> api!')
    // })

    app.get('/status', (req, res) => {
        res.send("Operational🚀");
    })

    app.get('/check/login', isLoggedIn, isLoggedIn, (req, res) => {
        res.send(req.user);
    });

    app.listen(port, () => {
        console.log(`Git.bid API listening at http://localhost:${port}`)
    })



    app.post("/post/bounty", (req, res) => {
        console.log(req.body)
        res.send(req.body)
    });

    //MIGRATIONS

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