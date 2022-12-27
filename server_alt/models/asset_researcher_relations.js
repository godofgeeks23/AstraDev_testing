const mongoose = require('mongoose')

const asset_researcher_relation = new mongoose.Schema({

    asset_id: { type: String, required: true },
    researcher_id: { type: String, required: true },
    reporting_manager: { type: String, required: true },
    created_date: { type: Date, default: Date.now },
    
})

const model = mongoose.model("asset_researcher_relations", asset_researcher_relation)

module.exports = model