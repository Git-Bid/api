const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
require('dotenv').config();

const GITHUB_CLIENT_ID = "b3dec5a8697f01c59c74"

const GITHUB_CLIENT_SECRET = "27fdc53ee5777185d9069501716eba84fd3d76f0";

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});
passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));