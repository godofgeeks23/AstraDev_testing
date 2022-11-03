const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')
const validator = require('validator');
const asset = require('./models/asset.model')
const vulnerability = require('./models/vulnerability.model')

dotenv.config()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.DB_CONNECT, () => console.log("connected to DB"));

app.post('/api/register', async (req, res) => {
	console.log(req.body)
	try {

		const newPassword = await bcrypt.hash(req.body.password, 10)

		const user = await User.create({
			fname: req.body.fname,
			mname: req.body.mname,
			lname: req.body.lname,
			username: req.body.username,
			email: req.body.email,
			password: newPassword,
			isAdmin: req.body.isAdmin,
		})
		console.log("user registered!");
		res.json({ status: "ok", user, token })
	} catch (error) {
		console.log("user already exists!")
		res.json({ status: "error", error })
	}

})

app.post('/api/login', async (req, res) => {

	var user = null;
	if (validator.isEmail(req.body.email)) {
		user = await User.findOne({
			email: req.body.email,
		})
	}
	else {
		console.log("got username - " + req.body.email)
		user = await User.findOne({
			username: req.body.email,
		})
	}

	if (!user) { return { status: 'error', error: 'Invalid user' } }
	const isPasswordValid = await bcrypt.compare(req.body.password, user.password)

	if (isPasswordValid) {
		console.log("logged in successfully!")
		const token = jwt.sign({
			name: user.name,
			email: user.email,
		}, 'secret123')
		return res.json({ status: "ok", user: token })
	} else {
		console.log("invalid credentials!")
		return res.json({ status: "error", user: false })
	}
})

app.post('/api/quote', async (req, res) => {

	const token = req.body.xaccesstoken
	try {
		const decoded = jwt.verify(token, 'secret123')
		const email = decoded.email
		const user = await User.findOne({ email: email })
		return res.json({ status: 'ok', quote: user.fname })
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'invalid token' })
	}

})

app.listen(1337, () => {
	console.log("Server startetd on 1337")
})

app.post('/api/add_asset', async (req, res) => {
	console.log(req.body)
	try {
		const new_asset = await asset.create({
			title: req.body.title,
			type:  req.body.type,
			asset_id: req.body.asset_id,
			target: req.body.target,
			created_date: req.body.created_date,
			description: req.body.description,
		})
		console.log("asset added successfully!");
		res.json({ status: "ok"})
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
		res.json({ status: "ok"})
	} catch (error) {
		res.json({ status: "error", error })
	}
})
