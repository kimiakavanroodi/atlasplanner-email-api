const gcloud = require('./SecretManager')

module.exports.getConfig = async function getConfig(secret, versionNum) {
    return await gcloud.getSecret(secret, versionNum)
};
  
