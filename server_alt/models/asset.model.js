const mongoose = require('mongoose')
const validator = require('validator');

const manager = new mongoose.Schema({
  mngr_id: { type: String, required: true }
});

const asset = new mongoose.Schema({

  title: { type: String, required: true },
  type: { type: String, required: true },
  target: { type: String, required: true },
  created_date: { type: Date, default: Date.now },
  description: { type: String, default: null },
  assignor_managers: { type: Array, required: true, default: [] },
  assignee_managers: { type: Array, default: [] },

})

const model = mongoose.model("assets_collection", asset)

module.exports = model