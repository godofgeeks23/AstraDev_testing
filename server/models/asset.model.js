const mongoose = require('mongoose')
const validator = require('validator');

const asset = new mongoose.Schema({

    title: { type: String, required: true },
    type: { type: String, required: true },
    asset_id: { type: String, required: true, unique: true },
    target: { type: String, required: true },
    created_date: { type: Date, default: Date.now },
    description: { type: String, default: null },

})

const model = mongoose.model("assets_collection", asset)

module.exports = model