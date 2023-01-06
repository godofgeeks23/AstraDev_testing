const User = require('./../models/user');

let auth = (req, res, next) => {

    let token = req.cookies.auth;
    if (!token)
        token = req.headers.cookies;
    // console.log("token = ", token)
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if (!user) return res.json({
            error: true
        });

        req.token = token;
        req.user = user;
        next();

    })
}

module.exports = { auth };