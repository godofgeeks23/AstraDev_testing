const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/user')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')
const validator = require('validator');
const asset = require('./models/asset.model')
const vulnerability = require('./models/vulnerability.model')
const role = require('./models/roles')
const customer = require('./models/customer')

dotenv.config()

// app.use(cors())
app.use(express.json())

mongoose.connect(process.env.DB_CONNECT, () => console.log("Successfully Connected to DB!"));

async function get_results() {

  // res_asset = await asset.find()
  // console.log(res_asset);

  // var newrole = new role({
  //     role_name: "Employee",
  //     role_id: "jh32bjh3b2j265b7",
  // })
  // await newrole.save()

  const newrole = await role.create({
    role_name: "",
    role_id: "",
  });

}

get_results();