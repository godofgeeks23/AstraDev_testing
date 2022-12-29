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
const comment = require('./models/comment')
const activity = require("./models/activity.model")
const pending_user = require("./models/pending_user")
const asset_researcher_relation = require("./models/asset_researcher_relations")
const { ObjectId } = require('mongodb');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const fetch = require('node-fetch');
const login_activity = require('./models/login_activity');

const app = express();

app.use(cors({ origin: 'http://localhost:3001', credentials: true, exposedHeaders: ['Set-Cookie', 'Date', 'ETag'] }))
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cookieParser());

// database connection
mongoose.Promise = global.Promise;
mongoose.connect(db.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true }, function (err) {
    if (err) console.log(err);
    console.log("Establishing connection with MongoDB - Success");
});

async function saveLoginActivity(user_id, ip, host, browser, status) {
    const login = new login_activity({
        user_id: user_id,
        ip_address: ip,
        host: host,
        browser: browser,
        status: status,
    })
    await login.save()
}

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
        if (err) { console.log("err in fiding the token..."); }
        if (user) {
            // // check token's expiry
            if (new Date() < new Date(user.token_created_at.getTime() + (user.token_validity * 60 * 1000))) {
                return res.status(400).json({
                    error: true,
                    message: "You are already logged in"
                });
            }
            else {
                // delete the expired token in the database
                user.update({ $unset: { token: 1 } }, function (err, user) {
                    if (err) return cb(err);
                    return res.json({
                        error: true,
                        message: "Your session has expired. Please login again."
                    });
                })
            }
        }
        else {
            User.findOne({ 'email': req.body.email }, function (err, user) {
                if (!user) return res.json({ isAuth: false, message: ' Auth failed ,email not found' });

                user.comparepassword(req.body.password, (err, isMatch) => {
                    // debugger;
                    if (!isMatch) return res.json({ isAuth: false, message: "password doesn't match" });

                    user.generateToken((err, user) => {
                        if (err) return res.status(400).send(err);
                        console.log("saving token auth in cookies...")
                        // update login activity
                        saveLoginActivity(user._id, JSON.stringify(req.ip), req.headers.host, req.headers['user-agent'], true).then(() => { console.log("login activity updated. ") })
                        res.cookie('auth', user.token).json({
                            isAuth: true,
                            id: user._id,
                            email: user.email
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

app.post('/api/enable2FA', auth, async (req, res) => {
    const secret = speakeasy.generateSecret({ name: 'Astra Security' });
    const url = speakeasy.otpauthURL({ secret: secret.ascii, label: req.user.email, issuer: 'Astra Security' });
    const qr = await qrcode.toDataURL(url);
    const this_user = await User.findOne({
        _id: req.user._id,
    })
    this_user.two_fa_secret = secret.ascii;
    await this_user.save();
    console.log("2FA secret saved in user records.")
    res.json({ secret: secret.ascii, qr });
})

app.post('/api/verify2FA', auth, async (req, res) => {
    const this_user = await User.findOne({
        _id: req.user._id,
    })
    const verified = speakeasy.totp.verify({
        secret: this_user.two_fa_secret,
        encoding: 'ascii',
        token: req.body.token
    });
    if (verified) {
        res.json({ verified: true });
    } else {
        res.json({ verified: false });
    }
})

app.get('/', function (req, res) {
    res.status(200).send(`Welcome to login , sign-up api`);
});

// add asset
app.post('/api/addAsset', auth, async (req, res) => {
    // console.log("Added by - ", req.user.role_id)
    if (req.user.role_id == "100") {
        try {
            const new_asset = await asset.create({
                title: req.body.title,
                type: req.body.type,
                target: req.body.target,
                description: req.body.description,
                assignor_managers: [req.user._id],
            })
            console.log("asset added successfully!");

            res.json({ status: "ok", asset_id: new_asset._id })
        } catch (error) {
            res.json({ status: "error", error })
        }
    }
    else {
        res.json({ status: "error", message: "you are not authorized to add an asset in the DB" })
    }
})

app.post('/api/removeAsset', auth, async function (req, res) {
    try {
        await asset.findByIdAndDelete(req.body.id);
        res.json({ status: "ok" })
    } catch (e) {
        res.json({ status: "error", e })
    }
})

// modify asset
app.post('/api/editAsset', auth, async (req, res) => {
    // console.log("Added by - ", req.user.role_id)
    if (req.user.role_id == "100") {
        try {
            await asset.findByIdAndUpdate(req.body.id, {
                title: req.body.title,
                type: req.body.type,
                target: req.body.target,
                description: req.body.description,
            })
            console.log("asset modified successfully!");

            res.json({ status: "ok" })
        } catch (error) {
            res.json({ status: "error", error })
        }
    }
    else {
        res.json({ status: "error", message: "you are not authorized to modify this asset" })
    }
})

// get assets
app.post('/api/getManagerAssets', auth, async function (req, res) {
    console.log(req.body.asset_id)
    if (req.body.targets == "all") {
        const assets = await asset.find({ assignor_managers: req.user._id })
        var assets_list = [];
        var total_vuln_count = 0;
        assets.forEach(async (asset) => {
            const asset_vulns = await vulnerability.find({ parent_asset: asset._id })
            total_vuln_count += asset_vulns.length;
            const thisasset = {
                id: asset._id,
                title: asset.title,
                description: asset.description,
                asset_vuln_count: asset_vulns.length,
                critical_vuln_count: asset_vulns.filter(vuln => vuln.severity == "critical").length,
                high_vuln_count: asset_vulns.filter(vuln => vuln.severity == "high").length,
                medium_vuln_count: asset_vulns.filter(vuln => vuln.severity == "medium").length,
                low_vuln_count: asset_vulns.filter(vuln => vuln.severity == "low").length,
            }
            assets_list.push(thisasset);
            if (assets_list.length == assets.length) {
                res.json({
                    total_asset_count: assets.length,
                    total_vuln_count: total_vuln_count,
                    assets: assets_list,
                })
            }
        })
    }
    else {
        const assets = await asset.find({ assignor_managers: req.user._id, _id: req.body.targets })
        var assets_list = [];
        var total_vuln_count = 0;
        assets.forEach(async (asset) => {
            const asset_vulns = await vulnerability.find({ parent_asset: asset._id })
            total_vuln_count += asset_vulns.length;
            const thisasset = {
                id: asset._id,
                title: asset.title,
                description: asset.description,
                asset_vuln_count: asset_vulns.length,
                critical_vuln_count: asset_vulns.filter(vuln => vuln.severity == "critical").length,
                high_vuln_count: asset_vulns.filter(vuln => vuln.severity == "high").length,
                medium_vuln_count: asset_vulns.filter(vuln => vuln.severity == "medium").length,
                low_vuln_count: asset_vulns.filter(vuln => vuln.severity == "low").length,
            }
            assets_list.push(thisasset);
            if (assets_list.length == assets.length) {
                res.json({
                    total_asset_count: assets.length,
                    total_vuln_count: total_vuln_count,
                    assets: assets_list,
                })
            }
        })
    }
});

app.post('/api/addVulnerability', auth, async (req, res) => {
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
            description: req.body.description,
            user_id: req.user._id,
            cwe: req.body.cwe,
            cvss: req.body.cvss,
            lastModifiedByUser: req.user._id,
            lastModifiedDate: req.body.created_date,
        })
        console.log("vulnerability added successfully!");
        res.json({ status: "ok" })
    } catch (error) {
        res.json({ status: "error", error })
    }
})

app.post('/api/removeVulnerability', async function (req, res) {
    try {
        await vulnerability.findByIdAndDelete(req.body.id);
        res.json({ status: "ok" })
    } catch (e) {
        res.json({ status: "error", e })
    }
})

// modify vulnerability
app.post('/api/editVulnerability', async (req, res) => {
    try {
        await vulnerability.findByIdAndUpdate(req.body.id, {
            type: req.body.type,
            name: req.body.name,
            severity: req.body.severity,
            url: req.body.url,
            status: req.body.status,
            parent_asset: req.body.parent_asset,
            description: req.body.description,
            cwe: req.body.cwe,
            cvss: req.body.cvss,
            lastModifiedByUser: req.user._id,
            lastModifiedDate: Date.now(),
        })
        console.log("vulnerability modified successfully!");
        res.json({ status: "ok" })
    } catch (error) {
        res.json({ status: "error", error })
    }
})

// assign asset to user
app.post('/api/assignAsset', auth, async (req, res) => {
    // check if user is manager
    if (req.user.role_id == "100") {
        //  check if user with given researcher id exists
        const researcher = await User.findOne({ _id: req.body.researcher_id, role_id: "102" })
        if (!researcher) { res.json({ status: "error", error: "Researcher does not exist." }) }
        else {
            // check if researcher is in manager's team
            if (researcher.reporting_to == req.user._id) {
                try {
                    // create a document in asset_researcher_relation collection
                    const new_relation = await asset_researcher_relation.create({
                        asset_id: req.body.asset_id,
                        researcher_id: req.body.researcher_id,
                        reporting_manager: req.user._id,
                    })
                    // send OK response
                    res.json({ status: "ok" })
                }
                catch (error) { res.json({ status: "error", error }) }
            }
            else { res.json({ status: "error", error: "Researcher is not in your team." }) }
        }
    }
    else { res.json({ status: "error", error: "You are not authorized for assignment operations." }) }
})

// unassign asset from user
app.post('/api/unassignVulnerability', auth, async (req, res) => {
    // check if user is manager
    if (req.user.role_id == "100") {
        //  check if user with given researcher id exists
        const researcher = await User({ _id: req.body.researcher_id, role_id: "102" })
        if (!researcher) { res.json({ status: "error", error: "Researcher does not exist." }) }
        else {
            // check if researcher is in manager's team
            if (researcher.reporting_to == req.user._id) {
                try {
                    // delete document from asset_researcher_relation collection
                    await asset_researcher_relation.deleteOne({ asset_id: req.body.asset_id, researcher_id: req.body.researcher_id })
                    // send OK response
                    res.json({ status: "ok" })
                }
                catch (error) { res.json({ status: "error", error }) }
            }
            else { res.json({ status: "error", error: "Researcher is not in your team." }) }
        }
    }
    else { res.json({ status: "error", error: "You are not authorized for assignment operations." }) }
})

app.post('/api/addRole', async (req, res) => {
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

app.post('/api/addCustomer', async (req, res) => {
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

app.post('/api/addComment', auth, async (req, res) => {
    console.log(req.body)
    try {
        const new_activity = await activity.create({
            user_id: req.body.user_id,
            content: "Added comment: '" + req.body.content + "'",
            vuln_id: req.body.vuln_id,
            fname: req.body.fname,
            lname: req.body.lname,
            username: req.body.username,
            cust_id: req.body.cust_id,
            role_id: req.body.role_id,
            cname: req.body.cname,
        })
        console.log("Activity created successfully!");
        console.log("activity id: ", new_activity._id);
        const new_comment = await comment.create({
            user_id: req.body.user_id,
            content: req.body.content,
            vuln_id: req.body.vuln_id,
            activity_id: new_activity._id,
            fname: req.body.fname,
            lname: req.body.lname,
            username: req.body.username,
            cust_id: req.body.cust_id,
            role_id: req.body.role_id,
            cname: req.body.cname,
        })
        console.log("Comment added successfully!");
        res.json({ status: "ok" })
    } catch (error) {
        res.json({ status: "error", error })
    }
})

app.get('/api/test_nesting', async function (req, res) {

    // console.log("can access test_nesting api if 'auth' is set to " + auth)
    // res.json({
    //     status: "ok"
    // })

    // console.log('Headers: ' + JSON.stringify(req.headers));
    console.log('Host: ' + req.headers.host);
    console.log('Browser: ' + req.headers['user-agent']);
    console.log('Accept: ' + req.headers['accept']);
    console.log('Language: ' + req.headers['accept-language']);
    console.log('Encoding: ' + req.headers['accept-encoding']);
    console.log('Connection: ' + req.headers['connection']);
    console.log('Upgrade-Insecure-Requests: ' + req.headers['upgrade-insecure-requests']);
    console.log('IP: ' + req.ip);   // ipv6 address
    // extract ipv4 address from ipv6 address
    var ipv4 = req.ip.split(':').pop();
    console.log('IPv4: ' + ipv4);

    // var geo = geoip.lookup(req.ip);
    // console.log("Country: " + (geo ? geo.country: "Unknown"));
    // console.log("Region: " + (geo ? geo.region: "Unknown"));
    // console.log(geo);

    var fetch_res = await fetch(`https://ipapi.co/${req.ip}/json/`);
    var fetch_data = await fetch_res.json()
    console.log(`Location: ${fetch_data.city}, ${fetch_data.region}, ${fetch_data.country}`)

    res.status(200);
    res.header("Content-Type",'application/json');
    res.end(JSON.stringify({status: "OK"}));

});

app.post('/api/createPendingUser', async (req, res) => {
    console.log(req.body)
    try {
        const new_pending_user = await pending_user.create({
            email: req.body.email,
            role_id: req.body.role_id,
            invited_by: req.body.invited_by,
            validity: req.body.validity,
        })
        console.log("Pending user added! (id: ", new_pending_user.id + ")");
        res.json({ pending_user_id: new_pending_user._id, status: "ok" })
    } catch (error) {
        res.json({ status: "error", error })
    }
})

app.post('/api/validatePendingUser', async (req, res) => {
    // console.log(req.body)
    const thispendinguser = await pending_user.findOne({
        _id: ObjectId(req.body.pending_user_id),
    })
    if (thispendinguser) {
        // implement token time validity test here
        console.log("Validation successful!");
        await pending_user.remove(({ _id: ObjectId(req.body.pending_user_id) }), function (err) {
            if (err) { console.log(err) }
            else { console.log("User Activated. Removed from *pending users* state..."); }
        });
        res.json({ user: thispendinguser, status: "ok" })
    }
    else {
        res.json({ status: "error" })
    }
})

app.post('/api/resetPassword', async (req, res) => {
    try {
        const forgot_user = await User.findOne({
            email: req.body.email,
        })
        const reset_token_plain = forgot_user._id + forgot_user.email;
        const reset_token_hashed = crypto.createHmac('sha256', reset_token_plain).digest('hex');
        if ((reset_token_hashed === req.body.resetpswd_token) && (req.body.password === req.body.password2)) {
            // console.log("token hash check completed")
            bcrypt.genSalt(10, function (err, salt) {
                if (err) return next(err);
                bcrypt.hash(req.body.password, 10, function (err, hash) {
                    if (err) return next(err);
                    // next();
                    forgot_user.password = hash;
                    forgot_user.password2 = hash;
                    User.findByIdAndUpdate(forgot_user._id, {
                        password: hash,
                        password2: hash
                    }).then(() => { console.log("Modified records saved. Password reset successfull"); })
                })
            })
            res.json({ status: "ok" })
        }
        else
            res.json({ status: "error" })
    } catch (error) {
        res.json({ status: "error", error })
    }
})

// get security provider managers
app.get('/api/getSecProviderMngrs', async function (req, res) {
    // find security provider customers
    const sec_provider_cust = await customer.find({
        is_sec_provider: true,
    })
    // console.log(sec_provider_cust)
    // find users with customer id in sec_provider_cust and role_id = 100
    const sec_provider_mngrs = await User.find({
        cust_id: { $in: sec_provider_cust.map(cust => cust._id) },
        role_id: 100,
    }, { _id: 1, fname: 1 })
    res.json({
        status: "ok",
        sec_provider_mngrs: sec_provider_mngrs
    })
});

// add a member to a manager's team
app.post('/api/addTeamMember', auth, async (req, res) => {
    if (req.user.role_id == "100") {
        const this_user = await User.findOne({
            _id: ObjectId(req.body.user_id),
        })
        if (this_user.cust_id === req.user.cust_id) {
            this_user.reporting_to = req.user._id;
            await this_user.save();
            res.json({ status: "ok" })
        }
        else {
            res.json({ status: "error" })
        }
    }
    else {
        res.json({ status: "error", message: "you are not authorized to add a member to team." })
    }
})

// get team members of a manager
app.get('/api/getTeamMembers', auth, async function (req, res) {
    if (req.user.role_id == "100") {
        const team_members = await User.find({
            reporting_to: req.user._id,
        })
        res.json({
            status: "ok",
            team_members: team_members
        })
    }
    else {
        res.json({ status: "error", message: "you are not authorized to view members list" })
    }
});

// remove a member from a manager's team
app.post('/api/removeTeamMember', auth, async (req, res) => {
    if (req.user.role_id == "100") {
        const this_user = await User.findOne({
            _id: ObjectId(req.body.user_id),
        })
        if (this_user.cust_id === req.user.cust_id) {
            this_user.reporting_to = null;
            await this_user.save();
            res.json({ status: "ok" })
        }
        else {
            res.json({ status: "error" })
        }
    }
    else {
        res.json({ status: "error", message: "you are not authorized to remove a member from team." })
    }
})

// send reset password mail
app.post('/api/sendResetPasswordMail', async (req, res) => {
    const forgot_user = await User.findOne({
        email: req.body.email,
    })
    const reset_token_plain = forgot_user._id + forgot_user.email;
    const reset_token_hashed = crypto.createHmac('sha256', reset_token_plain).digest('hex');
    const req_body = {
        source: "support@cyethack.com",
        destinations: [req.body.email],
        subject: "Password Reset Request",
        body: "Reset Password",
        html: "<h1>Visit http://localhost:3001/resetpassword?email=" + req.body.destination + "&token=" + reset_token_hashed + " to reset your password.<h1>",
    }
    fetch('https://qet85fubbi.execute-api.ap-south-1.amazonaws.com/dev/sendemail', {
        method: 'POST',
        // credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req_body)
    }).then((r) => {
        r.json().then((data) => {
            console.log("Response returned by Mailing API: ", data)
            if (data.message_id) { res.json({ status: "ok" }) }
            else { res.json({ status: "error", error: "unable to send mail" }) }
        })
    })
})

// listening port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend server is live at port ${PORT}!`);
});