const mongoose = require('mongoose')

const login_activity = new mongoose.Schema({

    createdDate: { type: Date, default: Date.now }, // date of login
    user_id: { type: String, required: true },  // user_id of the user who logged in
    ip_address: { type: String, required: true },   // ip address of the user who logged in
    host: { type: String, required: true }, // host of the user who logged in
    browser: { type: String, required: true },  // browser of the user who logged in
    status: { type: Boolean, default: true }, // true - login success, false - login failed
    city: { type: String, default: null },  // city of the user who logged in
    region: { type: String, default: null },    // region of the user who logged in
    region_code: { type: String, default: null },   // region code of the user who logged in
    country: { type: String, default: null },   // country of the user who logged in
    country_name: { type: String, default: null },  // country name of the user who logged in
    country_code: { type: String, default: null },  // country code of the user who logged in
    country_code_iso3: { type: String, default: null }, // country code in iso3 format
    country_capital: { type: String, default: null },   // country capital of the user who logged in
    country_tld: { type: String, default: null },   // country's top level domain 
    continent_code: { type: String, default: null },    // continent code to which the country belongs
    in_eu: { type: String, default: null }, // true - country is in EU, false - country is not in EU
    postal: { type: String, default: null },    // postal code of the user who logged in
    latitude: { type: String, default: null },  // latitude of the user who logged in
    longitude: { type: String, default: null }, // longitude of the user who logged in
    timezone: { type: String, default: null },  // timezone of the user who logged in
    utc_offset: { type: String, default: null },    // utc offset of the user who logged in
    country_calling_code: { type: String, default: null },  // country calling code of the user who logged in
    currency: { type: String, default: null },  // currency of the user who logged in
    currency_name: { type: String, default: null }, // currency name of the user who logged in 
    languages: { type: String, default: null },     // languages spoken in the country of the user who logged in
    country_area: { type: String, default: null },  // area of the country of the user who logged in
    country_population: { type: String, default: null },    // population of the country of the user who logged in
    asn: { type: String, default: null },   // asn of the user who logged in
    org: { type: String, default: null },   // org of the user who logged in
})

const model = mongoose.model("login_activity", login_activity)

module.exports = model