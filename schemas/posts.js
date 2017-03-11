var mongoose = require('mongoose');

 mongoose.Schema ({
    postSubject: { type: String, required: true, unique: true},
    postBody: { type: String, required: true},
   /* postSlug: { type: String, required: true},
    postStatus: { type: Boolean, required: true},
    postPrivacy: { type: Boolean, required: true},
    postLikes: { type: Boolean, required: true},*/
    createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now}
});

module.exports = postSchema;
