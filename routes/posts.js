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
router.get('/', csrfProtection, amIauthenticated, function(req, res) {
 Post.find()
  .sort({ createdAt: "descending" })
  .exec(function(err, posts) {
    if (err) { return next(err); }
    res.render("posts", { posts: posts,  csrfToken: req.csrfToken()  });
  });
});





router.get("/new", csrfProtection, amIauthenticated, function(req, res){
  res.render("newPost", { csrfToken: req.csrfToken() } );
});
//new post router
//Normally, this would be a PUT request, but browsers support only GET and POST in HTML forms
router.post("/new",  parseForm, csrfProtection, function(req, res, next){
  new Post({
      postSubject    : req.body.subject,
      postBody    : req.body.textbody
      }).save(function(err) {
    if (err) {
        return res.send(err);
    }
    res.send( 'it worked!' );
  });
});

/* req.user.displayName = req.body.displayname;
  req.user.bio = req.body.bio;
  req.user.save(function(err){
    if (err){
      next(err);
      return;
    }
    req.flash("info", "Profile updated!");
    res.redirect("/edit");
    */


/*
var todo = new Todo(req.body);  
todo.save(function (err, createdTodoObject) {  
    if (err) {
        res.send(err);
    }
    // This createdTodoObject is the same one we saved, but after Mongo
    // added its additional properties like _id.
    res.send(createdTodoObject);
    */

module.exports = router;
