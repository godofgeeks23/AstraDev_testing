const mongoose = require('mongoose')
const validator = require('validator');

const User = new mongoose.Schema({

  fname: { type: String, required: true },
  mname: { String, required: false },
  lname: { type: String, required: true },
  username: { type: String, required: true, trim: true, unique: true },
  email: {
    type: String, unique: true, required: true, trim: true, lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    }
  },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdDate: { type: Date, default: Date.now },

  pswd_created: { type: Date, default: Date.now },
  status: { type: Boolean, default: true },
  cust_id: { type: String, default: null },
  token: { type: String, default: null },
  role_id: { type: String, default: null },

})

const model = mongoose.model("schema_alpha_user", User)

module.exports = model