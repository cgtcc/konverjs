
var express     = require('express');
var api         = express();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken');
var User   = require('../../models/users'); // get our mongoose model

// API ROUTES ------------------
api.get('/', function(req, res) {
  res.json({ message: 'The API is working!' });
});

// route to return all users (GET http://localhost:3333/api/users)
api.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});   


// route to authenticate a user (POST http://localhost:8080/api/authenticate)

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
// Route for user logins
    api.post('/authenticate', function(req, res) {
        var loginusername = (req.body.username).toLowerCase(); // Ensure username is checked in lowercase against database
        User.findOne({ username: loginusername }).select('username password active').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var username = {
                    from: 'AwesomeApp Staff, admin@localhost',
                    to: 'admin@localhost',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(username, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.username); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if user is found in the database (based on username)           
                if (!user) {
                    res.json({ success: false, message: 'Username not found' }); // Username not found in database
                } else if (user) {
                    // Check if user does exist, then compare password provided by user
                    if (!req.body.password) {
                        res.json({ success: false, message: 'No password provided' }); // Password was not provided
                    } else {
                        var validPassword = user.comparePassword(req.body.password); // Check if password matches password provided by user 
                        if (!validPassword) {
                            res.json({ success: false, message: 'Could not authenticate password' }); // Password does not match password in database
                        } else if (!user.active) {
                            res.json({ success: false, message: 'Account is not yet activated. Please check your e-mail for activation link.', expired: true }); // Account is not activated 
                        } else {
                            var token = jwt.sign({ username: user.username }, config.secret, { expiresIn: '24h' }); // Logged in: Give user token
                            res.json({ success: true, message: 'User authenticated!', token: token }); // Return token in JSON object to controller
                        }
                    }
                }
            }
        });
});


module.exports = api;
