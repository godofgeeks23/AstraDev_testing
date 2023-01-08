const mongoose = require('mongoose')

const manager = new mongoose.Schema({
  mngr_id: { type: String, required: true }
});

const asset = new mongoose.Schema({

  type: { type: String, required: true },
  title: { type: String, required: true },
  created_date: { type: Date, default: Date.now },
  description: { type: String, default: null },
  assignor_managers: { type: Array, required: true, default: [] },
  assignee_managers: { type: Array, default: [] },
  tags: { type: Array, default: [] },
  description_file: { type: String, default: null },
  rating: { type: Number, default: 0 },
  website_url: { type: String, default: null },
  postman_api_file: { type: String, default: null },
  ip_range: { type: String, default: null },
  app_store_url: { type: String, default: null },
  app_file: { type: String, default: null },


})

const model = mongoose.model("assets_collection", asset)

module.exports = model