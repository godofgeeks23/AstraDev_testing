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

async function get_results()
{
    res_asset = await asset.find()

    console.log(res_asset);
}
get_results();