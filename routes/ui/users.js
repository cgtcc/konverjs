
//add csrf protection requirements for forms
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var bodyParser = require('body-parser');
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });
var configurations = require('../../configuration');

var host = "localhost:3333";
//for email validaton
var nodemailer = require("nodemailer");
var redis = require('redis');
var redisClient = redis.createClient(); // default setting.
var sgTransport = require('nodemailer-sendgrid-transport'); // Import Nodemailer Sengrid Transport Package
var async = require('async');
/*
    * Here we are configuring our SMTP Server details.
    * STMP is mail server which is responsible for sending and receiving email.
  * We are using Sendgrid here.
*/

var options = {
  auth: {
    api_user: configurations.sendgridUsername,
    api_key: configurations.sendgridPassword
  }
};



var smtpTransport = nodemailer.createTransport(sgTransport(options)); // Use if using sendgrid configuration
// End Sendgrid Configuration Settings  
/*------------------SMTP Over-----------------------------*/

//start user management and routing requirements
var express = require('express');
var passport = require("passport");
//load our model inside the route file
var User = require("../../models/users");
var setUpPassport = require("../../middlewares/configpassport");
//load routing libraries from express framework
var router = express.Router();


// we need this because "cookie" is true in csrfProtection 
router.use(cookieParser());


// Sets useful variables for your templates
router.use(function (req, res, next) {
  res.locals.currentUser = req.user; //every view have access to the current user, wich pulls from req.user, wich is populated by Passport.
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});

router.get('/setup', function (req, res) {

  // create a sample user
  var defaultUser = new User({
    username: "administrator",
    password: "administrator",
    displayName: "administrator",
    firstName: "John",
    lastName: "Doe",
    bio: "lorem",
    email: "dskfj@kdjsf.com"
  });

  // save the sample user
  defaultUser.save(function (err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});



//Middleware for determining if the user is authenticated
/*it's important to load this function before loading the routes, so every routes will inhert from this Middleware
if amIauthenticated is passed to the routes.*/
function amIauthenticated(req, res, next) {
  if (req.isAuthenticated()) {  //this function is provided by passport.  Makes our life easier, and safer.
    next();
  } else {
    req.flash("info", "You must login first in order to access this ressource.");
    res.redirect("/login");
  }
}




//adding email invitation route (index page)


router.get("/", csrfProtection, function (req, res) {
  res.render("index", { csrfToken: req.csrfToken() });
});



/* GET users listing. */
// queries the users collection, returning the newest users first
router.get("/users", amIauthenticated, function (req, res, next) {
  User.find()
    .sort({ createdAt: "descending" })
    .exec(function (err, users) {
      if (err) { return next(err); }
      res.render("users", { users: users });
    });
});





//adding sign-up routes

/*
router.get("/signup", csrfProtection, function(req, res) {
  res.render("signup", { csrfToken: req.csrfToken(), email: req.query.mail });
});

*/
//body-parser adds the username and password to req.body
router.post("/signup", parseForm, csrfProtection, function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;

  //call findOne to return just one user. We want a match on usernames here
  User.findOne({ username: username }, function (err, user) {
    if (err) {
      return next(err); //passe vers la création du newUser
    }
    if (user) {
      //if you find a user, you should bail out because that username already exist 
      req.flash("error", "User already exist");
      return res.redirect("/posts");
    }

    //else create a new instance of the user model and continues to the next request handler
    var newUser = new User({
      username: username,
      password: password
    });
    //saves the user to the database and continues to the next request handler
    newUser.save(next);
  });
  //authenticate the user
}, passport.authenticate("login", {
  successRedirect: "/profile",
  failureRedirect: "/",
  failureFlash: true
}));

//profile router
router.get("/users/:username", amIauthenticated, function (req, res, next) {
  User.findOne({ username: req.params.username }, function (err, user) {
    if (err) { return next(err); }
    if (!user) { return next(404); }
    res.render("profile", { user: user });
  });
});

//login router - will simply render the login view with the login form
router.get("/login", csrfProtection, function (req, res) {
  res.render("login", { csrfToken: req.csrfToken() });
});

//login form action
router.post("/login", parseForm, csrfProtection, passport.authenticate("login", {
  successRedirect: "/posts",
  failureRedirect: "/login",
  failureFlash: true
}));

//logout router
router.get("/logout", amIauthenticated, function (req, res) {
  req.logout();  //request logout to passport.js
  res.redirect("/");  //redirect to home after logout
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

//***********************sendgrid routes start here  */
//routes required for email verifications through Sendgrid:
router.post('/send', function (req, res) {
  console.log(req.body.to);
  async.waterfall([
    // Check if email already exists.
    // format to store in Redis is {email : unique key}
    function (callback) {
      redisClient.exists(req.body.to, function (err, reply) {
        if (err) {
          return callback(true, "Error in redis");
        }
        if (reply === 1) {
          return callback(true, "Email already requested");
        }
        callback(null);
      });
    },
    function (callback) {
      // Generating random string.
      let rand = Math.floor((Math.random() * 100) + 54);
      let encodedMail = new Buffer(req.body.to).toString('base64');
      let link = "http://" + req.get('host') + "/verify?mail=" + encodedMail + "&id=" + rand;
      let mailOptions = {
        from: configurations.emailFrom,
        to: req.body.to,
        subject: 'Your Activation Link',
        text: 'Hello! Thank you for registering at localhost.com. Please click on the following link to complete your activation: ' + link,
        html: 'Hello!,<br><br>Thank you for registering at localhost.com. Please click on the link below to complete your activation:' + link
      };
      callback(null, mailOptions, rand);
      console.log(mailOptions);
    },
    function (mailData, secretKey, callback) {
      console.log(mailData);


      // Sending email using Sendgrid.
      smtpTransport.sendMail(mailData, function (error, response) {
        if (error) {
          console.log(error);
          return callback(true, "Error in sending email");
        }





        console.log("Message sent: " + JSON.stringify(response));
        // Adding hash key.
        redisClient.set(req.body.to, secretKey);
        redisClient.expire(req.body.to, 600); // setting expiry for 10 minutes.
        callback(null, "Email sent Successfully");
      });
    }
  ], function (err, data) {
    console.log(err, data);
    res.json({ error: err === null ? false : true, data: data });
  });
});

router.get('/verify', csrfProtection, function (req, res) {
  if ((req.protocol + "://" + req.get('host')) === ("http://" + host)) {
    async.waterfall([
      function (callback) {
        let decodedMail = new Buffer(req.query.mail, 'base64').toString('ascii');
        redisClient.get(decodedMail, function (err, reply) {
          if (err) {
            return callback(true, "Error in redis");
          }
          if (reply === null) {
            return callback(true, "Invalid email address");
          }
          callback(null, decodedMail, reply);
        });
      },
      function (key, redisData, callback) {
        if (redisData === req.query.id) {
          redisClient.del(key, function (err, reply) {
            if (err) {
              return callback(true, "Error in redis");
            }
            if (reply !== 1) {
              return callback(true, "Issue in redis");
            }
            console.log("Email is verified");
            res.render("signup", { csrfToken: req.csrfToken(), email: req.query.mail });
          });
        } else {
          return callback(true, "Invalid token");
        }
      }
    ], function (err, data) {
      console.log(data);
      res.send(data);
    });
  } else {
    res.end("<h1>Request is from unknown source");
  }
});

//************************************end of Sendgrid routes


module.exports = router;
