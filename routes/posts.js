
//add csrf protection requirements for forms
var cookieParser = require('cookie-parser');  
var csrf = require('csurf');  
var bodyParser = require('body-parser');  
var csrfProtection = csrf({ cookie: true });  
var parseForm = bodyParser.urlencoded({ extended: false });
var configurations = require('../configuration');

//start post management and routing requirements
var express = require('express');
var passport = require("passport");
//load our model inside the route file
var Post = require("../models/posts");
var setUpPassport = require("../configpassport");
//load routing libraries from express framework
var router = express.Router();


// we need this because "cookie" is true in csrfProtection 
router.use(cookieParser());


// Sets useful variables for your templates
router.use(function(req, res, next){
  res.locals.currentPosts = req.post; //every view have access to the current post, wich pulls from req.post, wich is populated by Passport.
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});


//Middleware for determining if the post is authenticated
/*it's important to load this function before loading the routes, so every routes will inhert from this Middleware
if amIauthenticated is passed to the routes.*/
function amIauthenticated(req, res, next){
  if (req.isAuthenticated()) {  //this function is provided by passport.  Makes our life easier, and safer.
    next();
  } else {
    req.flash("info", "You must login first in order to access this ressource.");
    res.redirect("/login");
  }
}



/* GET posts listing. */
router.get('/',amIauthenticated, function(req, res) {
 Post.find()
  .sort({ createdAt: "descending" })
  .exec(function(err, posts) {
    if (err) { return next(err); }
    res.render("posts", { posts: posts });
  });
});

module.exports = router;
