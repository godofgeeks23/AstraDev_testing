const User = require('./../models/user');

let auth = (req, res, next) => {
    // const token = req.header('Authorization').replace('Bearer ', '');
    let token = req.cookies.auth;
    if (!token)
        token = req.headers.cookies;
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