const mongoose = require('mongoose')

const comment = new mongoose.Schema({

  createdDate: { type: Date, default: Date.now },
  user_id: { type: String, default: null },
  content: { type: String, required: true },
  media: { type: String, default: null },
  vuln_id: { type: String, required: true},
  activity_id: { type: String, required: true },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String },
  cust_id: { type: String, default: null },
  role_id: { type: String, default: null },
  cname: { type: String },

})

const model = mongoose.model("schema_comments", comment)

module.exports = model
