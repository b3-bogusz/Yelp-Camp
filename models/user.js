const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

// will add username, hash password, salt value to a Schema from passportLocalMongoose//
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);