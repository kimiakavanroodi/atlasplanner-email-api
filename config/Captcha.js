const rp = require('request-promise')

module.exports.validateCaptcha = async function validateCaptcha(secret, key) {
    return await rp({
        uri: `https://recaptcha.google.com/recaptcha/api/siteverify?secret=${secret}&response=${key}`,
        method: 'GET',
        json: true
    })
};