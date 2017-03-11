var mongoose = require('mongoose');

//Defining the user schema 
var userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    displayName: String,
    firstName: String,
    lastName: String,
    bio: String,
    admin: Boolean

});


module.exports = userSchema;