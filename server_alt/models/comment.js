const mongoose = require('mongoose')

const comment = new mongoose.Schema({

  createdDate: { type: Date, default: Date.now },
  user_id: { type: String, default: null },
  content: { type: String, required: true },
  media: { type: String, default: null },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  // vuln id
  // acvitiy id
  

})

const model = mongoose.model("schema_comments", comment)

module.exports = model
