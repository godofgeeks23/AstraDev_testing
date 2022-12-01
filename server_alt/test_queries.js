const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const role = require('./models/roles')

const app = express()

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