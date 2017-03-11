



var express = require('express');
var api = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var User = require('../../models/users'); // get our mongoose model
var configurations = require('../../configuration');



// API ROUTES ------------------

// route to authenticate a user (POST http://localhost:3333/api/authenticate)

// route to authenticate a user (POST http://localhost:3333/api/authenticate)
// Route for user logins
api.post('/authenticate', function (req, res) {
    var loginusername = (req.body.username).toLowerCase(); // Ensure username is checked in lowercase against database
    User.findOne({ username: loginusername }).select('username password active').exec(function (err, user) {
        if (err) {
            // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.

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
                    } //else if (!user.active) {
                    // res.json({ success: false, message: 'Account is not yet activated. Please check your e-mail for activation link.', expired: true }); // Account is not activated } 
                    else {
                        var token = jwt.sign({ username: user.username }, configurations.secret, { expiresIn: '24h' }); // Logged in: Give user token
                        res.json({ success: true, message: 'User authenticated!', token: token }); // Return token in JSON object to controller
                    }
                }
            }
        }
    });
});




api.get('/', amIapiAuthenticated, function (req, res) {
    res.json({ message: 'The API is working!' });
});

// route to return all users (GET http://localhost:3333/api/users)
api.get('/users', amIapiAuthenticated, function (req, res) {
    User.find({}, function (err, users) {
        res.json(users);
    });
});





//profile router
api.get('/users/:username', amIapiAuthenticated, function (req, res, next) {
    User.findOne({ username: req.params.username }).select('username').exec(function (err, user) {
        if (err) {
            res.json({ status: 0, message: err });
        }
        if (!user) {
            res.json({ status: 0, msg: "not found" });
        }
        res.json({ status: 1, username: user.username, message: " success" });
    });
});



function amIapiAuthenticated(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, api.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
}









module.exports = api;
