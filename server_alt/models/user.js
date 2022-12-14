var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const confiq = require('../config/config').get(process.env.NODE_ENV);
const validator = require('validator');
const salt = 10;

const userSchema = new mongoose.Schema({

    fname: { type: String, required: true },
    mname: { String, required: false },
    lname: { type: String, required: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: {
        type: String, unique: true, required: true, trim: true, lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    password: { type: String, required: true },
    password2: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    createdDate: { type: Date, default: Date.now },

    pswd_created: { type: Date, default: Date.now },
    status: { type: Boolean, default: true },
    cust_id: { type: String, default: null },
    token: { type: String, default: null },
    role_id: { type: String, default: null },

    invited_by: { type: String, default: null },



})


// to signup a user
userSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(salt, function (err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                user.password = hash;
                user.password2 = hash;
                next();
            })

        })
    }
    else {
        next();
    }
});

//to login
userSchema.methods.comparepassword = function (password, cb) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        // console.log(password, this.password)
        if (err) return cb(next);
        cb(null, isMatch);
    });
}

// generate token
userSchema.methods.generateToken = function (cb) {
    var user = this;
    // var token = jwt.sign(user._id.toHexString(), confiq.SECRET);

    const token = jwt.sign({ "data": user._id }, confiq.SECRET,
        function (err, token) {
            if (err) {
                console.log("Error in token generation - ", err);
            } else {
                console.log("Token generated.");
                user.token = token;
                user.save(function (err, user) {
                    if (err) return cb(err);
                    cb(null, user);
                })
            }
        });

}

// find by token
userSchema.statics.findByToken = function (token, cb) {
    var user = this;

    jwt.verify(token, confiq.SECRET, function (err, decode) {
        try {
            user.findOne({ "_id": decode.data, "token": token }, function (err, user) {
                if (err) return cb(err);
                cb(null, user);
            })
        }
        catch (err) {
            // console.log("error:", err)
            cb(true, null);
        }
    })
};

//delete token

userSchema.methods.deleteToken = function (token, cb) {
    var user = this;

    user.update({ $unset: { token: 1 } }, function (err, user) {
        if (err) return cb(err);
        cb(null, user);
    })
}


module.exports = mongoose.model('schema_beta_user', userSchema);