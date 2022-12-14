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
const asset_researcher_relation = require("./models/asset_researcher_relations")
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const fetch = require('node-fetch');
const login_activity = require('./models/login_activity');
const Cvss = require('cvss-calculator');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();
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

// update login activity
async function saveLoginActivity(user_id, ip, host, browser, status) {
    var ipv4 = ip.split(':').pop();
    var fetch_res = await fetch(`https://ipapi.co/${ipv4}/json/?key=${process.env.IP_API_KEY}`);
    var fetch_data = await fetch_res.json()
    const login = new login_activity({
        user_id: user_id,
        ip_address: ipv4,
        host: host,
        browser: browser,
        status: status,
        city: fetch_data.city,
        region: fetch_data.region,
        region_code: fetch_data.region_code,
        country: fetch_data.country,
        country_name: fetch_data.country_name,
        country_code: fetch_data.country_code,
        country_code_iso3: fetch_data.country_code_iso3,
        country_capital: fetch_data.country_capital,
        country_tld: fetch_data.country_tld,
        continent_code: fetch_data.continent_code,
        in_eu: fetch_data.in_eu,
        postal: fetch_data.postal,
        latitude: fetch_data.latitude,
        longitude: fetch_data.longitude,
        timezone: fetch_data.timezone,
        utc_offset: fetch_data.utc_offset,
        country_calling_code: fetch_data.country_calling_code,
        currency: fetch_data.currency,
        currency_name: fetch_data.currency_name,
        languages: fetch_data.languages,
        country_area: fetch_data.country_area,
        country_population: fetch_data.country_population,
        asn: fetch_data.asn,
        org: fetch_data.org,
    })
    await login.save()
}

// send email to the new user
async function sendOnboardingMail(email, activation_token) {
    const req_body = {
        source: "support@cyethack.com",
        destinations: [email],
        subject: "Invitation to Cyethack",
        body: "Join the Team!",
        html: "<h1>Visit http://localhost:3001/activateuser?token=" + activation_token + " to initiate onboarding!<h1>"
    }
    fetch(process.env.LAMBDA_SES_ENDPOINT, {
        method: 'POST',
        // credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req_body)
    }).then((r) => {
        r.json().then((data) => {
            console.log("Response returned by Mailing API: ", data)
            if (data.message_id) { return true; }
            else { return false; }
        })
    })
}

// create a new pending user (invite user)
async function createPendingUser(email, role, invited_by) {
    try {
        var new_user_obj = {};
        const new_user = await User.create({
            email: email,
            role_id: role,
            invited_by: invited_by,
            status: false,
        })
        new_user_obj._id = new_user._id;
        const activation_token = jwt.sign({ "data": new_user._id }, process.env.JWT_SECRET, { expiresIn: parseInt(process.env.INVITE_TOKEN_EXPIRY) },
            async function (err, activation_token) {
                if (err) {
                    console.log("Error in Activation token generation - ", err);
                } else {
                    console.log("Activation Token generated.");
                    new_user.activation_token = activation_token;
                    new_user.activation_token_created_at = Date.now();
                    await new_user.save()
                    // send email to the new user
                    await sendOnboardingMail(email, activation_token);
                    console.log(activation_token)
                }
            });
        return new_user_obj;
    }
    catch (err) {
        return err;
    }
}

async function sendResetPasswordMail(email, reset_token) {
    const req_body = {
        source: "support@cyethack.com",
        destinations: [email],
        subject: "Reset Password",
        body: "Reset Password",
        html: "<h1>Visit http://localhost:3001/resetpassword?email=" + email + "&token=" + reset_token + " to reset your password.<h1>"
    }
    fetch(process.env.LAMBDA_SES_ENDPOINT, {
        method: 'POST',
        // credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req_body)
    }).then((r) => {
        r.json().then((data) => {
            console.log("Response returned by Mailing API: ", data)
            if (data.message_id) { return true; }
            else { return false; }
        })
    })
}

async function generateResetPasswordToken(email) {
    try {
        const this_user = await User.findOne({ email: email });
        const reset_pswd_token = jwt.sign({ "data": this_user._id }, process.env.JWT_SECRET, { expiresIn: parseInt(process.env.RESET_TOKEN_EXPIRY) },
            async function (err, reset_token) {
                if (err) {
                    console.log("Error in Reset password token generation - ", err);
                } else {
                    console.log("Reset password Token generated.");
                    this_user.reset_password_token = reset_token;
                    this_user.reset_password_token_created_at = Date.now();
                    await this_user.save()
                    // send email to the new user
                    await sendResetPasswordMail(email, reset_token);
                    console.log(reset_token)
                }
            });
        return reset_token;
    }
    catch (err) {
        return err;
    }
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
                        saveLoginActivity(user._id, req.ip, req.headers.host, req.headers['user-agent'], true).then(() => { console.log("login activity updated. ") })
                        // res.cookie('auth', user.token).json({
                        //     isAuth: true,
                        //     id: user._id,
                        //     email: user.email
                        // });
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
        cname: thiscustomer.cname,
        is_sec_provider: thiscustomer.is_sec_provider,
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
                description: req.body.description,
                assignor_managers: [req.user._id],
                tags: req.body.tags,
                description_file: req.body.description_file,
                rating: req.body.rating,
                website_url: req.body.website_url,
                postman_api_file: req.body.postman_api_file,
                ip_range: req.body.ip_range,
                app_store_url: req.body.app_store_url,
                app_file: req.body.app_file,
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
app.post('/api/unassignAsset', auth, async (req, res) => {
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
    // get all users
    var r = [];
    const users = await User.find({})
    // go through each user, and find his customer 
    users.forEach(async function (user) {
        customer.findOne({ cust_id: user.cust_id }).then(function (cust) {
            // find his role
            role.findOne({ role_id: user.role_id }).then(function (rol) {
                // push all data in r array
                r.push({
                    id: user._id,
                    name: user.fname + " " + user.lname,
                    email: user.email,
                    role_name: rol.role_name,
                    cust: cust
                })
                console.log({
                    id: user._id,
                    name: user.fname + " " + user.lname,
                    email: user.email,
                    role_name: rol.role_name,
                    cust: cust.cname
                })
            })
        })
    })
    //     const rol = await role.findOne({ role_id: user.role_id })
    //     r.push({
    //         id: user._id,
    //         name: user.fname + user.lname,
    //         email: user.email,
    //         role_name: rol.role_name,
    //         cname: cust.cname
    //     })
    // })
    res.json({ status: "ok", data: r }) 
});

app.post('/api/createPendingUser', auth, async (req, res) => {
    const temp = await createPendingUser(req.body.email, req.body.role_id, req.user._id)
    if (temp)
        res.json({ pending_user_id: temp._id, status: "ok" })
    else
        res.json({ status: "error", error: "error" })
})

app.post('/api/validatePendingUser', async (req, res) => {
    jwt.verify(req.body.token, process.env.JWT_SECRET, function (err, decode) {
        if (err) res.json({ status: "error", error: err });
        else {
            try {
                User.findOne({ "_id": decode.data, "activation_token": req.body.token, "email": req.body.email }, async function (err, user) {
                    user.status = true;
                    user.activation_token = null;
                    await user.save();
                    console.log("User Activated. Removed from *pending users* state...");
                    res.json({ status: "ok" })
                })
            }
            catch (err) {
                // console.log("error:", err)
                res.json({ status: "error", error: err })
            }
        }
    })
})

app.post('/api/resetPassword', async (req, res) => {
    try {
        const forgot_user = await User.findOne({
            email: req.body.email,
        })
        jwt.verify(req.body.token, process.env.JWT_SECRET, function (err, decode) {
            console.log("decode:", decode)
            if (err) res.json({ status: "error", error: err });
            else {
                try {
                    User.findOne({ "_id": decode.data, "reset_password_token": req.body.token, "email": req.body.email }, async function (err, user) {
                        user.reset_password_token = null;
                        bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS), function (err, salt) {
                            if (err) return next(err);
                            bcrypt.hash(req.body.password, parseInt(process.env.SALT_ROUNDS), function (err, hash) {
                                if (err) return next(err);
                                user.password = hash;
                                user.password2 = hash;
                                User.findByIdAndUpdate(user._id, {
                                    password: hash,
                                    password2: hash
                                }).then(() => { console.log("Modified records saved. Password reset successfull"); })
                            })
                        })
                        await user.save();
                        console.log("Password changed successfully!");
                        res.json({ status: "ok" })
                    })
                }
                catch (err) {
                    // console.log("error:", err)
                    res.json({ status: "error", error: err })
                }
            }
        })
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
app.get('/api/getTeamMembersAssetDetails', auth, async function (req, res) {
    if (req.user.role_id == "100") {
        const team_members = await User.find({ reporting_to: req.user._id, })
        var member_list = [];
        team_members.forEach(async member => {
            var thismember = {};
            thismember._id = member._id;
            thismember.fname = member.fname;
            thismember.email = member.email;
            thismember.profile_image = member.profile_image;
            thismember.role = "Researcher";
            var assets = [];
            var asset_researcher_relations = await asset_researcher_relation.find({ researcher_id: member._id, })
            asset_researcher_relations.forEach(async relation => {
                var asset = await asset.findOne({ _id: relation.asset_id, }, { _id: 1, title: 1, rating: 1, description: 1 })
                assets.push(asset)
            })
            thismember.assets = assets;
            member_list.push(thismember);
        })
        res.json({
            status: "ok",
            members_details: member_list
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
    if (forgot_user) {
        generateResetPasswordToken(forgot_user.email).then((token) => {
            res.json({ status: "ok", message: "Reset password link has been sent to your email." })
        }).catch((err) => {
            res.json({ status: "error", error: "unable to send mail" })
        })
    }
    else {
        res.json({ status: "error", error: "user not found" })
    }
})

// get login activity of a user
app.get('/api/getLoginActivity', auth, async function (req, res) {
    const activities = await login_activity.find({
        user_id: req.user._id,
    })
    res.json({
        status: "ok",
        activities: activities
    })
});

// post api to calculate the cvss score
app.get('/api/calculateCVSS', async (req, res) => {
    // get first letter of each parameter
    const av = req.body.attack_vector[0].toUpperCase();
    const ac = req.body.attack_complexity[0].toUpperCase();
    const pr = req.body.privileges_required[0].toUpperCase();
    const ui = req.body.user_interaction[0].toUpperCase();
    const s = req.body.scope[0].toUpperCase();
    const c = req.body.confidentiality[0].toUpperCase();
    const i = req.body.integrity[0].toUpperCase();
    const a = req.body.availability[0].toUpperCase();
    // create vector string
    const vector = `CVSS:3.1/AV:${av}/AC:${ac}/PR:${pr}/UI:${ui}/S:${s}/C:${c}/I:${i}/A:${a}`
    // create cvss object
    const cvss = new Cvss(vector);
    // return the cvss score
    res.json({
        status: "ok",
        cvss_vector: vector,
        cvss: {
            base_score: cvss.getBaseScore(),
            rating: cvss.getRating(),
            impact_score: cvss.getImpactScore(),
            exploitability_score: cvss.getExploitabilityScore(),
            temporal_score: cvss.getTemporalScore(),
            environmental_score: cvss.getEnvironmentalScore(),
        }
    })
})

// get asset list for team page
app.post('/api/editMemberPageListAssets', auth, async function (req, res) {
    if (req.user.role_id == "100") {
        var assigned_assets = [];
        var unassigned_assets = [];
        var asset_researcher_relations = await asset_researcher_relation.find({ researcher_id: req.body.researcher_id, })
        asset_researcher_relations.forEach(async relation => {
            var asset = await asset.findOne({ _id: relation.asset_id, }, { _id: 1, title: 1 })
            assigned_assets.push(asset)
        })
        // list all assets of manager and remove assigned assets from this list
        const all_assets = await asset.find({ assignor_managers: req.user._id }, { _id: 1, title: 1 })
        all_assets.forEach(asset => {
            if (!assigned_assets.includes(asset)) {
                unassigned_assets.push(asset)
            }
        })
        res.json({
            status: "ok",
            assigned_assets: assigned_assets,
            unassigned_assets: unassigned_assets
        })
    }
    else {
        res.json({ status: "error", message: "you are not authorized to view assets list" })
    }
});

// listening port
const PORT = process.env.BACKEND_PORT;
app.listen(PORT, () => {
    console.log(`Backend server is live at port ${PORT}!`);
});
