var mongoose = require('mongoose');


//Defining the user schema 
var userSchema = mongoose.Schema({
    token: String,
    username: { type: String, lowercase: true, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    displayName: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    bio: String,
    permission: { type: String, required: true, default: 'user' },
    active: { type: Boolean, required: true, default: false },
    resettoken: { type: String, required: false }
    /* temporarytoken: { type: String, required: true },
     },
     resettoken: { type: String, required: false },
     */
});


module.exports = userSchema;