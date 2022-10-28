const mongoose = require('mongoose')
const validator = require('validator');

const role = new mongoose.Schema({

  name: { type: String, required: true },
  role_id: { type: String, default : null},
  role_id: { type: String, default : null},
  createdDate: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
  status: { type: Boolean, default: true },

})

const model = mongoose.model("schema_alpha_roles", role)

module.exports = model