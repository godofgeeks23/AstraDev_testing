const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const User = require('./models/user');
const { auth } = require('./middlewares/auth');
const db = require('./config/config').get(process.env.NODE_ENV);
const asset = require('./models/asset.model')
const vulnerability = require('./models/vulnerability.model')
const role = require('./models/roles')
const customer = require('./models/customer')

const app = express();

// app use
app.use(cors({ origin: 'http://localhost:3001', credentials: true, exposedHeaders: ['Set-Cookie', 'Date', 'ETag'] }))
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cookieParser());

// app.use(function (req, res, next) {
//     res.header('Content-Type', 'application/json;charset=UTF-8')
//     res.header('Access-Control-Allow-Credentials', true)
//     res.header(
//         'Access-Control-Allow-Headers',
//         'Origin, X-Requested-With, Content-Type, Accept'
//     )
//     next()
// })

// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", 'http://localhost:3001')
//     res.setHeader("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type, Accept');
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST");
//     res.setHeader("Access-Control-Allow-Credentials", "true");
//     res.setHeader("Access-Control-Expose-Headers", "ETag");
//     if ('OPTIONS' == req.method) {
//         res.sendStatus(200);
//       }
//       else {
//         next();
//       }
//     // next();
// })


// database connection
mongoose.Promise = global.Promise;
mongoose.connect(db.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true }, function (err) {
    if (err) console.log(err);
    console.log("Establishing connection with MongoDB - Success");
});


// adding new user (sign-up route)
app.post('/api/register', function (req, res) {
    // taking a user
    const newuser = new User(req.body);
    console.log(newuser);

    if (newuser.password != newuser.password2) return res.status(400).json({ message: "password not match" });

    User.findOne({ email: newuser.email }, function (err, user) {
        if (user) return res.status(400).json({ auth: false, message: "email exits" });

        newuser.save((err, doc) => {
            if (err) {
                console.log(err);
                return res.status(400).json({ success: false });
            }
            res.status(200).json({
                succes: true,
                user: doc
            });
        });
    });
});


// login user
app.post('/api/login', function (req, res) {
    let token = req.cookies.auth;
    User.findByToken(token, (err, user) => {
        if (err) return res(err);
        if (user) return res.status(400).json({
            error: true,
            message: "You are already logged in"
        });

        else {
            User.findOne({ 'email': req.body.email }, function (err, user) {
                if (!user) return res.json({ isAuth: false, message: ' Auth failed ,email not found' });

                user.comparepassword(req.body.password, (err, isMatch) => {
                    if (!isMatch) return res.json({ isAuth: false, message: "password doesn't match" });

                    user.generateToken((err, user) => {
                        if (err) return res.status(400).send(err);
                        res.cookie('auth', user.token).json({
                            isAuth: true,
                            id: user._id
                            , email: user.email
                        });
                    });
                });
            });
        }
    });
});

//logout user
app.get('/api/logout', auth, function (req, res) {
    req.user.deleteToken(req.token, (err, user) => {
        if (err) return res.status(400).send(err);
        res.sendStatus(200);
    });

});

// get logged in user
app.get('/api/profile', auth, async function (req, res) {

    const thisrole = await role.findOne({
        role_id: req.user.role_id,
    })
    // console.log(thisrole.role_name)
    const thiscustomer = await customer.findOne({
        _id: req.user.cust_id,
    })
    res.json({
        isAuth: true,
        id: req.user._id,
        email: req.user.email,
        name: req.user.fname + req.user.lname,
        role_name: thisrole.role_name,
        cname: thiscustomer.cname
    })
});


app.get('/', function (req, res) {
    res.status(200).send(`Welcome to login , sign-up api`);
}); 


app.post('/api/add_asset', async (req, res) => {
    console.log(req.body)
    try {
        const new_asset = await asset.create({
            title: req.body.title,
            type: req.body.type,
            asset_id: req.body.asset_id,
            target: req.body.target,
            created_date: req.body.created_date,
            description: req.body.description,
        })
        console.log("asset added successfully!");
        res.json({ status: "ok" })
    } catch (error) {
        res.json({ status: "error", error })
    }
})

app.post('/api/add_vuln', async (req, res) => {
    console.log(req.body)
    try {
        const new_vuln = await vulnerability.create({
            type: req.body.type,
            name: req.body.name,
            created_date: req.body.created_date,
            severity: req.body.severity,
            url: req.body.url,
            status: req.body.status,
            parent_asset: req.body.parent_asset,
            id: req.body.id,
            description: req.body.description,
        })
        console.log("vulnerability added successfully!");
        res.json({ status: "ok" })
    } catch (error) {
        res.json({ status: "error", error })
    }
})

app.post('/api/add_role', async (req, res) => {
    console.log(req.body)
    try {
        const new_role = await role.create({
            role_name: req.body.role_name,
            role_id: req.body.role_id,
            status: req.body.status,
        })
        console.log("Role added successfully!");
        res.json({ status: "ok" })
    } catch (error) {
        res.json({ status: "error", error })
    }
})

app.post('/api/add_customer', async (req, res) => {
    console.log(req.body)
    try {
        const new_customer = await customer.create({
            cust_id: req.body.cust_id,
            cname: req.body.cname,
            status: req.body.status,
        })
        console.log("Customer added successfully!");
        res.json({ status: "ok" })
    } catch (error) {
        res.json({ status: "error", error })
    }
})

// listening port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend server is live at port ${PORT}!`);
});