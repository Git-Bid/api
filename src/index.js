const express = require('express')
var cors = require('cors')

const app = express()
app.use(cors())

var express_session = require("express-session");
const passport = require('passport');
const { Client } = require('node-postgres');
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
    console.log(process.env)

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


    app.get("/issue/:org/:repo/issues/:issue_id", (req, res) => {
        res.send(req.params);
    });


    app.post("/post/bounty", isLoggedIn, isBounty, async(req, res) => {
        let response = await client.query("/dt")
        res.send(response)
        // console.log(req.body)
        // res.send(req.body.issue)

    });

    const YOUR_DOMAIN = 'http://localhost:3000';
    app.post('/create-checkout-session', async(req, res) => {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Stubborn Attachments',
                        images: ['https://i.imgur.com/EHyR2nP.png'],
                    },
                    unit_amount: 2000,
                },
                quantity: 1,
            }, ],
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}/success.html`,
            cancel_url: `${YOUR_DOMAIN}/cancel.html`,
        });
        res.json({ id: session.id });
    });


    //MIGRATIONS
    require('./migrations')(app, client);


    app.listen(port, () => {
        console.log(`Git.bid API listening at http://localhost:${port}`)
    })
}

start()