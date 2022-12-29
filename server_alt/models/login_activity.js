const mongoose = require('mongoose')

const login_activity = new mongoose.Schema({
    
    createdDate: { type: Date, default: Date.now },    
    user_id: { type: String, required: true },    
    ip_address: { type: String, required: true },    
    host: { type: String, required: true },    
    browser: { type: String, required: true },
    status: { type: Boolean, default: true }, // true - login success, false - login failed
    location: { type: String, default: null }, // location of the user

})

const model = mongoose.model("login_activity", login_activity)

module.exports = model