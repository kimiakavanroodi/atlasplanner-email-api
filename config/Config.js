const gcloud = require('./SecretManager')

module.exports.getConfig = async function getConfig(secret) {
    return await gcloud.getSecret(secret)
};
  
