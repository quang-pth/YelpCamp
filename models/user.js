const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// add username and password to Schema
// ensure username is unique and add some methods to UserSchema
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);











