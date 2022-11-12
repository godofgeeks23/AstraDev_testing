const mongoose = require('mongoose')
const validator = require('validator');

const customer = new mongoose.Schema({

  createdDate: { type: Date, default: Date.now },
  cust_id: { type: String, default: null },
  cname : { type: String, required: true },
  status: { type: Boolean, default: true },
  is_sec_researcher: { type: Boolean, default: false},
  is_customer: { type: Boolean, default: true},

})

const model = mongoose.model("schema_beta_customer", customer)

module.exports = model