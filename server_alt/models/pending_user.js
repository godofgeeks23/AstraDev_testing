const mongoose = require('mongoose')
const validator = require('validator');

const pending_user = new mongoose.Schema({

    email: { type: String, required: true },
    role_id: { type: String, required: true },
    invited_by: { type: String, required: true },
    invite_date: { type: Date, default: Date.now },
    validity: { type: Number },

})

const model = mongoose.model("pending_users", pending_user)

module.exports = model