const express = require('express')
var cors = require('cors')

const app = express()
app.use(cors())

var express_session = require("express-session");
const passport = require('passport');
const { Client } = require('pg');
const bodyParser = require('body-parser')
require('./passport')
const redis = require('redis');
require('dotenv').config();




const redisStore = require('connect-redis')(express_session);
const stripe = require('stripe')(process.env.stripe);


const redisClient = redis.createClient({
    host: process.env.redisclienthost
});

app.use(express_session({
    secret: 'Jacob iz hawt',
    name: 'Sessionssss',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Note that the cookie-parser module is no longer needed
    store: new redisStore({ host: process.env.redisclienthost, port: 6379, client: redisClient, ttl: 86400 }),
}, ), );

app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());

const isLoggedIn = require('./middleware/auth')
const isBounty = require('./middleware/bounty')

const port = 8080


async function start() {
    console.log("ENVIRONMENT", process.env)
    console.log("DATABASE", process.env.database)

    const client = new Client({
        user: process.env.user,
        host: process.env.host,
        database: process.env.database,
        password: process.env.password,
        port: 5432
    });


    await client.connect()

    require('./debug')(app, isLoggedIn);
    require('./auth')(app);

    //MIGRATIONS
    require('./migrations')(app, client);


    app.get("/issue/:org/:repo/issues/:issue_id", (req, res) => {
        res.send(req.params);
    });


    app.post("/post/bounty", isBounty, async(req, res) => {
        try {
            let query = `INSERT INTO bounties (issue, bounty_amount, github) Values ('hasura/graphql-engine/issues/6337', '2000', 'https://github.com/henrymarks1');`;
            client.query(query, (err, resp) => {
                console.log(err, resp);
                res.send(resp);
                client.end();
            });
        } catch (error) {
            res.status(420).send("there was an error inserting this");
        }

        // console.log(req.body)
        // res.send(req.body.issue)
    });


    const YOUR_DOMAIN = 'http://localhost:3000';
    app.post('/create/bounty', async(req, res) => {
        let amount = req.body.amount;
        let issue_id = req.body.issue_id;
        if (typeof amount === "number" && issue_id != null) {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Sponsor Issue #${issue_id}',
                            //images: ['https://i.imgur.com/EHyR2nP.png'],
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                }, ],
                mode: 'payment',
                success_url: `${YOUR_DOMAIN}/success.html`,
                cancel_url: `${YOUR_DOMAIN}/cancel.html`,
            });
            res.json({ id: session.id });
        } else {
            res.status(420).send("Bruh get your request together my manz🌿")
        }
    });

    app.listen(port, () => {
        console.log(`Git.bid API listening at http://localhost:${port}`)
    })
}

start()