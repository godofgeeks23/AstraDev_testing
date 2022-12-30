const mongoose = require('mongoose')

const login_activity = new mongoose.Schema({
    
    createdDate: { type: Date, default: Date.now },    
    user_id: { type: String, required: true },    
    ip_address: { type: String, required: true },    
    host: { type: String, required: true },    
    browser: { type: String, required: true },
    status: { type: Boolean, default: true }, // true - login success, false - login failed
    city: { type: String, default: null},
    region: { type: String, default: null},
    region_code: { type: String, default: null},
    country: { type: String, default: null},
    country_name: { type: String, default: null},
    country_code: { type: String, default: null},
    country_code_iso3: { type: String, default: null},
    country_capital: { type: String, default: null},
    country_tld: { type: String, default: null},
    continent_code: { type: String, default: null},
    in_eu: { type: String, default: null},
    postal: { type: String, default: null},
    latitude: { type: String, default: null},
    longitude: { type: String, default: null},
    timezone: { type: String, default: null},
    utc_offset: { type: String, default: null},
    country_calling_code: { type: String, default: null},
    currency: { type: String, default: null},
    currency_name: { type: String, default: null},
    languages: { type: String, default: null},
    country_area: { type: String, default: null},
    country_population: { type: String, default: null},
    asn: { type: String, default: null},
    org: { type: String, default: null},
})

const model = mongoose.model("login_activity", login_activity)

module.exports = model