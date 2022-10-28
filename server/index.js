const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')
const validator = require('validator');

dotenv.config()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.DB_CONNECT, () => console.log("connected to DB"));

app.post('/api/register', async (req, res) => {
	console.log(req.body)
	try {

		const newPassword = await bcrypt.hash(req.body.password, 10)

		const user = await User.create({
			// name: req.body.name,
			// password: req.body.password,

			fname: req.body.fname,
			mname: req.body.mname,
			lname: req.body.lname,
			username: req.body.username,
			email: req.body.email,
			// password: req.body.password,
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

// app.get('/api/quote', async (req, res) => {

// 	// const token = req.body.xaccesstoken
// 	const token = req.body.xaccesstoken

// 	console.log('received token: ', token)

// 	try {
// 		const decoded = jwt.verify(token, 'secret123')
// 		const email = decoded.email
// 		const user = await User.findOne({email: email})

// 		return res.json({ status: 'ok', quote: user.name})

// 	} catch(error) {
// 		console.log(error)
// 		res.json({status: 'error', error: 'invalid token'})
// 	}

// })

app.post('/api/quote', async (req, res) => {

	// const token = req.headers['x-access-token']

	const token = req.body.xaccesstoken

	// console.log('received token: ', req)

	try {
		// const decoded = jwt.verify(token, 'secret123')
		// const email = decoded.email
		// await User.updateOne({email: email}, {$set: {quote: req.body.quote}})
		// return { status: 'ok'}

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