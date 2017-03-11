
//Bcrypt works by running a part of the algorithm many times to give you a secure hash, but that number of times is configurable. The higher the number, the more secure the hash but the longer it will take. 

//For development, use bcrypt-nodejs.  For faster results in production, use bcrypt.  In order to install bcrypt, you should first be able to compile (install gcc and make) on your system.  On ubuntu, simply install build-essentials package
//var bcrypt = require("bcrypt-nodejs");  Bcrypt is written in C++, while bcrypt-nodejs is 100% javascript, and do not require compilation.
//Do not forget to recompile bcrypt if gcc is updated on your system.
var bcrypt = require("bcrypt-nodejs");
var mongoose = require('mongoose');
var userSchema = require('./schemas/users');

var SALT_FACTOR = 10;






//Asynchronous Pre-save action to hash the password
//Before you save your model to the database, you’ll run code that will hash the password. 

//declare emptu variable noop, a callback to be called during the hash calculation to signify progress
var noop = function() {};

//Defining the user schema 
var userSchema = mongoose.Schema ({
    token:    String,
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now},
    displayName: String,
    firstName: String,
    lastName: String,
    bio: String

});
//function to run before saving the password in the databse
//we need to check if the user did a password change, or if a new password was created for a new user.  Then, we generate a Salt factor, we can use while we perform password encryption.
userSchema.pre("save", function(done){
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
     bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) { return done(err); }
    /*bcrypt.hash(data, salt, progress, cb)
data - [REQUIRED] - the data to be encrypted.
salt - [REQUIRED] - the salt to be used to hash the password.
progress - a callback to be called during the hash calculation to signify progress
callback - [REQUIRED] - a callback to be fired once the data has been encrypted.
error - First parameter to the callback detailing any errors.
result - Second parameter to the callback providing the encrypted form.*/
    bcrypt.hash(user.password, salt, noop, function(err, hashedPassword) {
      if (err) { return done(err); }
      user.password = hashedPassword;
      done();
    });
  });
});


//checking the user's password
/*Note :  we use bcrypt.compare instead of a simple equality check (with something like ===). This is for security reasons : it helps keep us safe from a complicated hacker trick called a timing attack.  In cryptography, a timing attack is a side channel attack in which the attacker attempts to compromise a cryptosystem by analyzing the time taken to execute cryptographic algorithms.  Finding secrets through timing information may be significantly easier than using cryptanalysis of known plaintext, ciphertext pairs. Sometimes timing information is combined with cryptanalysis to improve the rate of information leakage.*/

userSchema.methods.checkPassword = function(guess, done) {
  bcrypt.compare(guess, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};


//Adding a simple method to the user model 
//If the user has defined a display name, return that; otherwise, return their username. The next listing shows how to add that.


userSchema.methods.name = function(){
    return this.displayName || this.username;
};



// Creating and exporting the user model.   
// Attach that schema to an actual model.
var User = mongoose.model("User", userSchema);

module.exports = User;