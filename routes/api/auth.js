
var express     = require('express');
var api         = express();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken');
var User   = require('../../models/users'); // get our mongoose model

// API ROUTES ------------------
api.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

// route to return all users (GET http://localhost:3333/api/users)
api.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});   




module.exports = api;
