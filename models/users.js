
//Bcrypt works by running a part of the algorithm many times to give you a secure hash, but that number of times is configurable. The higher the number, the more secure the hash but the longer it will take. 

//For development, use bcrypt-nodejs.  For faster results in production, use bcrypt.  In order to install bcrypt, you should first be able to compile (install gcc and make) on your system.  On ubuntu, simply install build-essentials package
//var bcrypt = require("bcrypt-nodejs");  Bcrypt is written in C++, while bcrypt-nodejs is 100% javascript, and do not require compilation.
//Do not forget to recompile bcrypt if gcc is updated on your system.
var bcrypt = require("bcrypt-nodejs");
var mongoose = require('mongoose');


var SALT_FACTOR = 10;


//Defining the user schema 
var userSchema = mongoose.Schema ({
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now},
    displayName: String,
    firstName: String,
    lastName: String,
    bio: String

});


//Pre-save action to hash the password
//Before you save your model to the database, you’ll run code that will hash the password. 

var noop = function() {};


userSchema.pre("save", function(done){
    var user = this;

    if (!user.isModified("password")) {
        return done();
    }

     bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) { return done(err); }
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