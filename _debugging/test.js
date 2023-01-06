// const speakeasy = require('speakeasy')
// const qrcode = require('qrcode')

// var twofa_secret = speakeasy.generateSecret({
//     name: 'Astra Security',    
// })

// console.log("ascii secret: :", twofa_secret.ascii)

// qrcode.toDataURL(twofa_secret.otpauth_url, function(err, data_url) {
//     console.log("qrcode: ", data_url)
// })

// function verify2FAToken(token, secret) {
//     var verified = speakeasy.totp.verify({
//         secret: secret,
//         encoding: 'base32',
//         token: token
//     })
//     return verified
// }

// console.log(verify2FAToken("737269", twofa_secret.base32))
