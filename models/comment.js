const mongoose = require('mongoose')

const comment = new mongoose.Schema({

  createdDate: { type: Date, default: Date.now }, // date of creation of the comment
  user_id: { type: String, default: null },   // user id of the user who created the comment
  content: { type: String, required: true },  // content of the comment
  media: { type: String, default: null }, // media of the comment
  vuln_id: { type: String, required: true }, // vulnerability id of the comment
  activity_id: { type: String, required: true },  // activity id of the comment
  fname: { type: String, required: true },  // first name of the user who created the comment
  lname: { type: String, required: true },  // last name of the user who created the comment
  username: { type: String, required: true }, // username of the user who created the comment
  email: { type: String }, // email of the user who created the comment
  cust_id: { type: String, default: null },  // customer id of the user who created the comment
  role_id: { type: String, default: null },  // role id of the user who created the comment
  cname: { type: String },  // customer name of the user who created the comment

})

const model = mongoose.model("schema_comments", comment)

module.exports = model
