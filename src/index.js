const express = require("express")
const cors = require("cors")
const app = express();
const dotenv = require("dotenv")
const session = require("express-session")
const passport = require("passport")
const mongoose = require('mongoose');
const GoogleStrategy = require('passport-google-oauth20');
const GitHubStrategy = require('passport-github');
const FacebookStrategy = require('passport-facebook')
dotenv.config({ path: require('find-config')('.env') })
const userLogin = require("./models/user_model")



const URL = (`${process.env.START_MONGO}${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}${process.env.END_MONGO}`)
console.log(URL)
mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected!'));


app.use(cors({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true
}))

app.use(express.json())
app.set("trust proxy", 1);
app.use(
    session({
        secret: "secretcode",
        resave: true,
        saveUninitialized: true,
          cookie: {
            sameSite: "none",
            secure: true,
            maxAge: 1000 * 60 * 60 * 24 * 7 // One Week
          }
    }))

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    return done(null, user.id);
})

passport.deserializeUser((id, done) => {
    userLogin.findById(id)
        .then((docs) => { return done(null, docs); })
})

//google statergy
passport.use(new GoogleStrategy({
    clientID: `${process.env.GOOGLE_CLIENT_ID}`,
    clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
    callbackURL: `${process.env.BACKEND_URL}/login/oauth2/redirect/google`,
    // scope: [ 'profile' ],
    // state: true
},
    function (accessToken, refreshToken, profile, cb) {
        //called onn successful Authentication
        //Insert Into Database capestonedb.capestoneusers

        userLogin.findOne({ googleId: profile.id })
            .then((docs) => {

                if (!docs) {
                    console.log("(!docs :", docs);
                    const newUser = new userLogin({
                        googleId: profile.id,
                        username: profile.name.givenName
                    });
                    newUser.save().then(function () { return cb(null, newUser) })

                } else if (docs) {
                    console.log("(docs :", docs);
                    return cb(null, docs);
                }
            })
            .catch((err) => {
                console.log("ERROR");
                return cb(err, null);

            });



    }));

app.get('/login/google',
    passport.authenticate('google', { scope: ['profile'] }));

app.get('/login/oauth2/redirect/google',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        //successfull auth redirect to home
        console.log(`SUCCESS REDIRECT: ${process.env.FRONTEND_URL}/home`)
        res.redirect(`${process.env.FRONTEND_URL}/home`)
    });
//End Google Statergy


//github statergy
passport.use(new GitHubStrategy({
    clientID: `${process.env.GITHUB_CLIENT_ID}`,
    clientSecret: `${process.env.GITHUB_CLIENT_SECRET}`,
    callbackURL: `${process.env.BACKEND_URL}/login/oauth2/redirect/github`,
},
    function (accessToken, refreshToken, profile, cb) {
        userLogin.findOne({ githubId: profile.id })
            .then((docs) => {

                if (!docs) {
                    console.log("(!docs :", docs);
                    const newUser = new userLogin({
                        githubId: profile.id,
                        username: profile.username
                    });
                    newUser.save().then(function () { return cb(null, newUser) })

                } else if (docs) {
                    console.log("(docs :", docs);
                    return cb(null, docs);
                }
            })
            .catch((err) => {
                console.log("ERROR");
                return cb(err, null);

            });
    }));

app.get('/login/github',
    passport.authenticate('github'));

app.get('/login/oauth2/redirect/github',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function (req, res) {
        //successfull auth redirect to home
        res.redirect(`${process.env.FRONTEND_URL}/`)
    });
//End github Statergy

//Facebook statergy
passport.use(new FacebookStrategy({
    clientID: `${process.env.FACEBOOK_CLIENT_ID}`,
    clientSecret: `${process.env.FACEBOOK_CLIENT_SECRET}`,
    callbackURL: `${process.env.BACKEND_URL}/login/oauth2/redirect/facebook`,
},
    function (accessToken, refreshToken, profile, cb) {
        userLogin.findOne({ facebookId: profile.id })
            .then((docs) => {

                if (!docs) {
                    console.log("(!docs :", docs);
                    const newUser = new userLogin({
                        facebookId: profile.id,
                        username: profile.username
                    });
                    newUser.save().then(function () { return cb(null, newUser) })

                } else if (docs) {
                    console.log("(docs :", docs);
                    return cb(null, docs);
                }
            })
            .catch((err) => {
                console.log("ERROR");
                return cb(err, null);

            });
    }));

app.get('/login/facebook',
    passport.authenticate('facebook'));

app.get('/login/oauth2/redirect/facebook',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function (req, res) {
        //successfull auth redirect to home
        res.redirect(`${process.env.FRONTEND_URL}/`)
    });

//END Facebook statergy

app.get("/getuser", (req, res) => {
    res.send(req.user)
})

app.get("/", (req, res) => {
    res.send("Hello World");
})


app.get('/auth/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


app.listen(process.env.PORT || 4000, async () => {
    console.log("Server Starrted");

})