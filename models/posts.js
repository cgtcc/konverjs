
//Bcrypt works by running a part of the algorithm many times to give you a secure hash, but that number of times is configurable. The higher the number, the more secure the hash but the longer it will take. 

//For development, use bcrypt-nodejs.  For faster results in production, use bcrypt.  In order to install bcrypt, you should first be able to compile (install gcc and make) on your system.  On ubuntu, simply install build-essentials package
//var bcrypt = require("bcrypt-nodejs");  Bcrypt is written in C++, while bcrypt-nodejs is 100% javascript, and do not require compilation.
//Do not forget to recompile bcrypt if gcc is updated on your system.
var mongoose = require('mongoose');


//Defining the posts schema 
var postSchema = mongoose.Schema ({
    postTitle: { type: String, required: true, unique: true},
    postBody: { type: String, required: true},
    postSlug: { type: String, required: true},
    postStatus: { type: Boolean, required: true},
    postPrivacy: { type: Boolean, required: true},
    postLikes: { type: Boolean, required: true},
    createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now}
});



//Adding a simple method to the posts model 
//If the posts has defined a title, return that; otherwise, return postBody. The next listing shows how to add that.


postSchema.methods.title = function(){
    return this.postTitle || this.postBody;
};



// Creating and exporting the posts model.   
// Attach that schema to an actual model.
var posts = mongoose.model("posts", postSchema);

module.exports = posts;