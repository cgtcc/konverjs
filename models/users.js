
//Bcrypt works by running a part of the algorithm many times to give you a secure hash, but that number of times is configurable. The higher the number, the more secure the hash but the longer it will take. 

//For development, use bcrypt-nodejs.  For faster results in production, use bcrypt.  In order to install bcrypt, you should first be able to compile (install gcc and make) on your system.  On ubuntu, simply install build-essentials package
//var bcrypt = require("bcrypt-nodejs");  Bcrypt is written in C++, while bcrypt-nodejs is 100% javascript, and do not require compilation.
//Do not forget to recompile bcrypt if gcc is updated on your system.
var mongoose = require('mongoose');
var userSchema = require('./schemas/users');
var bcrypt = require('bcrypt-nodejs'); // Import Bcrypt Package
var titlize = require('mongoose-title-case'); // Import Mongoose Title Case Plugin
var validate = require('mongoose-validator'); // Import Mongoose Validator Plugin
var SALT_FACTOR = 10;

// User Name Validator
var nameValidator = [
    validate({
        validator: 'matches',
        arguments: /^(([a-zA-Z]{3,20})+[ ]+([a-zA-Z]{3,20})+)+$/,
        message: 'Name must be at least 3 characters, max 30, no special characters or numbers, must have space in between name.'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 20],
        message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

// User E-mail Validator
var emailValidator = [
    validate({
        validator: 'matches',
        arguments: /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/,
        message: 'Name must be at least 3 characters, max 40, no special characters or numbers, must have space in between name.'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 40],
        message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

// Username Validator
var usernameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
    }),
    validate({
        validator: 'isAlphanumeric',
        message: 'Username must contain letters and numbers only'
    })
];

// Password Validator
var passwordValidator = [
    validate({
        validator: 'matches',
        arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/,
        message: 'Password needs to have at least one lower case, one uppercase, one number, one special character, and must be at least 8 characters but no more than 35.'
    }),
    validate({
        validator: 'isLength',
        arguments: [8, 35],
        message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

//declare emptu variable noop, a callback to be called during the hash calculation to signify progress
var noop = function () { };

//Defining the user schema 
var userSchema = mongoose.Schema({
    token: String,
    name: { type: String, required: true, validate: nameValidator },
    username: { type: String, lowercase: true, required: true, unique: true, validate: usernameValidator },
    password: { type: String, required: true, validate: passwordValidator, select: false },
    email: { type: String, required: true, lowercase: true, unique: true, validate: emailValidator },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    displayName: String,
    firstName: String,
    lastName: String,
    bio: String,
    temporarytoken: { type: String, required: true },
    active: { type: Boolean, required: true, default: false },
    resettoken: { type: String, required: false },
    permission: { type: String, required: true, default: 'user' }
});
//function to run before saving the password in the databse
//we need to check if the user did a password change, or if a new password was created for a new user.  Then, we generate a Salt factor, we can use while we perform password encryption.
userSchema.pre("save", function (done) {
    var user = this;

    //if no change is made to the user password, then exit this function
    if (!user.isModified("password")) {
        return done();
    }
    /*genSalt(rounds, callback)
    rounds - [OPTIONAL] - the number of rounds to process the data for. (default - 10)
    callback - [REQUIRED] - a callback to be fired once the salt has been generated.
    error - First parameter to the callback detailing any errors.
    result - Second parameter to the callback providing the generated salt.*/
    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) { return done(err); }
        /*bcrypt.hash(data, salt, progress, cb)
    data - [REQUIRED] - the data to be encrypted.
    salt - [REQUIRED] - the salt to be used to hash the password.
    progress - a callback to be called during the hash calculation to signify progress
    callback - [REQUIRED] - a callback to be fired once the data has been encrypted.
    error - First parameter to the callback detailing any errors.
    result - Second parameter to the callback providing the encrypted form.*/
        bcrypt.hash(user.password, salt, noop, function (err, hashedPassword) {
            if (err) { return done(err); }
            user.password = hashedPassword;
            done();
        });
    });
});


//checking the user's password
/*Note :  we use bcrypt.compare instead of a simple equality check (with something like ===). This is for security reasons : it helps keep us safe from a complicated hacker trick called a timing attack.  In cryptography, a timing attack is a side channel attack in which the attacker attempts to compromise a cryptosystem by analyzing the time taken to execute cryptographic algorithms.  Finding secrets through timing information may be significantly easier than using cryptanalysis of known plaintext, ciphertext pairs. Sometimes timing information is combined with cryptanalysis to improve the rate of information leakage.*/

userSchema.methods.checkPassword = function (guess, done) {
    bcrypt.compare(guess, this.password, function (err, isMatch) {
        done(err, isMatch);
    });
};



// Method to compare passwords in API (when user logs in) 
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password); // Returns true if password matches, false if doesn't
};



//Adding a simple method to the user model 
//If the user has defined a display name, return that; otherwise, return their username. The next listing shows how to add that.


userSchema.methods.name = function () {
    return this.displayName || this.username;
};



// Creating and exporting the user model.   
// Attach that schema to an actual model.
var User = mongoose.model("User", userSchema);





module.exports = User;