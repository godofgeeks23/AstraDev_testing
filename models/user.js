var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const confiq = require('../config/config').get(process.env.NODE_ENV);
const validator = require('validator');
const salt = 10;

const userSchema = new mongoose.Schema({

    fname: { type: String, default: null },
    mname: { type: String, default: null },
    lname: { type: String, default: null },
    username: { type: String, trim: true, default: null },
    email: {
        type: String, unique: true, required: true, trim: true, lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    password: { type: String, default: null },  // password
    password2: { type: String, default: null },    // confirm password
    isAdmin: { type: Boolean, default: false }, // true - admin, false - user
    createdDate: { type: Date, default: Date.now }, // date of creation of user
    rating: { type: Number, default: 0 },   // rating of the user
    pswd_created: { type: Date, default: Date.now },    // password creation time
    status: { type: Boolean, default: true },   // true - active, false - inactive
    cust_id: { type: String, default: null },   // company id to which this user belongs
    role_id: { type: String, default: null },   // role id of this user
    invited_by: { type: String, default: null },    // user id who invited this user
    token: { type: String, default: null },    // token for login
    token_created_at: { type: Date, default: Date.now },    // token creation time
    token_validity: { type: Number, default: 120 }, // in minutes
    two_fa_secret: { type: String, default: null }, // two factor authentication secret
    reporting_to: { type: String, default: null },  // manager id to whom this user reports
    rating: { type: Number, default: 0 },      // rating of the user
    profile_image: { type: String, default: null }, // profile image of the user
    activation_token: { type: String, default: null }, // activation token for the new user
    activation_token_created_at: { type: Date, default: Date.now }, // activation token creation time
    reset_password_token: { type: String, default: null }, // reset password token
    reset_password_token_created_at: { type: Date, default: Date.now }, // reset password token creation time

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
                console.log("Error in login token generation - ", err);
            } else {
                console.log("Login Token generated.");
                user.token = token;
                user.token_created_at = Date.now();

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