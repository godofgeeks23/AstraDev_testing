const mongoose = require('mongoose')
const validator = require('validator');

const role = new mongoose.Schema({

  role_name: { type: String, required: true },
  role_id: { type: String, default: null },
  createdDate: { type: Date, default: Date.now },
  status: { type: Boolean, default: true },

})

const model = mongoose.model("schema_beta_roles", role)

module.exports = model