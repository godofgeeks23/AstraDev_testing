const mongoose = require('mongoose')

const customer = new mongoose.Schema({

  createdDate: { type: Date, default: Date.now }, // date of creation of the customer
  cname: { type: String, required: true }, // customer name
  status: { type: Boolean, default: true }, // status of the customer - active 1 or inactive 0
  is_sec_provider: { type: Boolean, default: false }, // is the customer a secondary provider
  is_customer: { type: Boolean, default: true }, // is the customer a customer
  profile_image: { type: String, default: null }, // profile image of the customer

})

const model = mongoose.model("schema_beta_customer", customer)

module.exports = model