const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname:{type: String},
    lastname:{type: String},
    email:{type: String},
    username:{type: String},
    password:{type: String},
    lastlogin:{type: Date},
});


/// Pre-save of user's hash or decrypted password to database

userSchema.pre('save', (next)=> {
    const users = this,
    SALT_FACTOR = 5;

    if(!users.isModified('password')) return next();
    bcrypt.genSalt(SALT_FACTOR, (err, salt)=> {
        if(err) return next(err);

        bcrypt.hash(users.password, salt, null, (err, hash)=> {
            if(err) return next(err);
            users.password = hash;
            next();
        });
    });
});

//// method to compare password for login

userSchema.methods.comparePassword = ((candidatePassword, cb)=> {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if(err) {return cb(err)}
        cb(null, isMatch);
    });
});

module.exports = mongoose.model('users', userSchema, 'users');