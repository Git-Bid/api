const express = require('express')
const app = express()
var session = require("express-session");
const passport = require('passport');
const { Client } = require('node-postgres');
const bodyParser = require('body-parser')
require('./passport')
const redis = require('redis');
require('./debug')(app);
require('./auth.js')(app);


const redisStore = require('connect-redis')(session);

const redisClient = redis.createClient({
    host: "sessions"
});

app.use(session({
    secret: 'Jacob iz hawt',
    name: 'Sessionssss',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Note that the cookie-parser module is no longer needed
    store: new redisStore({ host: 'sessions', port: 6379, client: redisClient, ttl: 86400 }),
}, ), );

const isLoggedIn = require('./middleware/auth')
const isBounty = require('./middleware/bounty')



app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

app.use(passport.session());

const port = 8080

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

    app.get("/issue/:org/:repo/issues/:issue_id", (req, res) => {
        res.send(req.params);
    });

    //DEBUG
    // app.get('/', (req, res) => {
    //     res.send('Welcome to the <a href="https://git.bid">git.bid</a> api!')
    // })
    

    app.post("/post/bounty", isLoggedIn, isBounty, (req, res) => {
        console.log(req.body)
        res.send(req.body.issue)

        // let query = 'INSERT ;'
        // let response = await client.query(query);

        //pk_test_51I7ulLHX1rk5bSX1NWKzYasE7DIcdINuZNebzwx6ywnMypYfnlVLR0pVg6MuTc8I3GuMmY4Fcymhhqhw2pcO3w8g00yko2X1T2

        // sk_test_51I7ulLHX1rk5bSX1MK50H6Dh0XUareNF98jfCZY6QT0Xxkek3btpPg4FpAHDD6RlUZxJjtJ3ryu2yqtmGxJ7Y1SG00EgWrpU48
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

    app.listen(port, () => {
        console.log(`Git.bid API listening at http://localhost:${port}`)
    })
}

start()