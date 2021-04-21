const mongoose = require('mongoose')
const Schema = mongoose.Schema;
//Require passport for our users
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

//Passport adds all we need for a user like username, password, etc. Check the docs of Passport-Local Mongoose for more info.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema)