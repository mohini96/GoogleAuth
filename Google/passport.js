var bodyParser=require('body-parser');
//var mongoose=require("mongoose");
var express=require('express');
var passport = require('passport');
const usermodel=require('./user').usermodel;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var configAuth=require('./config/auth');
var app=express();
app.set("view engine", "ejs");
app.set(__dirname+'/views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(passport.initialize());
app.use(passport.session());
//middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
    { return next();}

    // if they aren't redirect them to the home page
    res.redirect('/');
}
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    done(null, user.id);
});
app.get('/', function(req, res) {
    res.render('index.ejs'); // load the index.ejs file
});

app.get('/fail', function(req, res) {
   console.log('fail'); // load the index.ejs file
});

app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

// the callback after google has authenticated the user
app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect : '/profile',
        failureRedirect : '/fail'
    }));

// route for login form
// route for processing the login form
// route for signup form
// route for processing the signup form
// route for showing the profile page
app.get('/profile', function(req, res) {
    res.render('profile',{data:req.usermodel});

});

// route for logging out
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
passport.use('google',new GoogleStrategy({
    clientID:configAuth.googleAuth.clientID,
    clientSecret:configAuth.googleAuth.clientSecret,
    callbackURL:`http://localhost:8000/auth/google/callback`
},function(token,refreshToken,profile,done){
    process.nextTick(function(){
        // console.log(token);
        // console.log(refreshToken);
        // console.log(profile);
        //done(null,profile);
        usermodel.findOne({ 'google.id' : profile.id }, function(err, user) {
            if (err)
                return done(err);

            if (user) {

                // if a user is found, log them in
                return done(null, user);
            } else {
                // if the user isnt in our database, create a new user
                var newUser = new usermodel();

                // set all of the relevant information
                newUser.google.id    = profile.id;
                newUser.google.token = token;
                newUser.google.name  = profile.displayName;
                newUser.google.email = profile.emails[0].value; // pull the first email

                // save the user
                newUser.save(function(err) {
                    if (err){
                        throw err;}
                    return done(null, newUser);
                });
            }
        });
    });
}));
app.listen(8000,()=>{
    console.log(`started on port 8000`);
});




