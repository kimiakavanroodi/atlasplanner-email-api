const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function getSecret(secret, versionNum) {

    const name = `projects/133245124182/secrets/${secret}/versions/${versionNum}`;
    
    const [version] = await client.accessSecretVersion({
      name: name,
    });
    
    const payload = version.payload.data.toString();
    
    return payload;
}
    
module.exports.getSecret = getSecret;
