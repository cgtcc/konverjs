var express = require('express');

var User = require("../models/users");

var router = express.Router();

// Sets useful variables for your templates
router.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});


/* GET users listing. */
// queries the users collection, returning the newest users first

router.get('/', function(req, res, next) {
  User.find()
  .sort({ createdAt:"descending"})
  .exec(function(err, users) {
    if (err) { return next(err); }
    res.render("index", { users: users});
  });
});

module.exports = router;
