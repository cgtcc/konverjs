

//start user management and routing requirements
var express = require('express');
//load our model inside the route file
var User = require("../../models/users");
//load routing libraries from express framework
var router = express.Router();

var cookieParser = require('cookie-parser');

// we need this because "cookie" is true in csrfProtection 
router.use(cookieParser());


// Sets useful variables for your templates
router.use(function (req, res, next) {
  res.locals.currentUser = req.user; //every view have access to the current user, wich pulls from req.user, wich is populated by Passport.
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});



router.get("/", function (req, res) {
  res.status(200).json({ message: "It works!" });
});



/* GET users listing. */
// queries the users collection, returning the newest users first
router.get("/users", function (req, res, next) {
  User.find()
    .sort({ createdAt: "descending" })
    .exec(function (err, users) {
      if (err) { return next(err); }
      res.render("users", { users: users });
    });
});




//profile router
router.get("/users/:username", function (req, res, next) {
  User.findOne({ username: req.params.username }, function (err, user) {
    if (err) { return next(err); }
    if (!user) { return next(404); }
    res.render("profile", { user: user });
  });
});

router.get("/edit", amIauthenticated, csrfProtection, function (req, res) {
  res.render("edit", { csrfToken: req.csrfToken() });
});
//edit profile router
//Normally, this would be a PUT request, but browsers support only GET and POST in HTML forms
router.post("/edit", amIauthenticated, parseForm, csrfProtection, function (req, res, next) {
  req.user.displayName = req.body.displayname;
  req.user.bio = req.body.bio;
  req.user.save(function (err) {
    if (err) {
      next(err);
      return;
    }
    req.flash("info", "Profile updated!");
    res.redirect("/edit");
  });
});



module.exports = router;
