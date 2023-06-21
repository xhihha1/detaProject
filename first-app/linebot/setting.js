const line = require('@line/bot-sdk');
const {
  Deta
} = require('deta');

let client;

const config = {
  channelAccessToken: '',
  channelSecret: ''
};

function getLineClient() {
  if (config.channelAccessToken === '' ||
    config.channelSecret === '') {
    return false;
  }
  client = new line.Client(config);
  return client;
}

function getLineConfig() {
  if (config.channelAccessToken === '' ||
    config.channelSecret === '') {
    return false;
  }
  return config;
}

function setLineConfig(channelAccessToken, channelSecret) {
  if (channelAccessToken && channelSecret) {
    config.channelAccessToken = channelAccessToken;
    config.channelSecret = channelSecret;
    console.log('-- set line config success --');
  }
  return config;
}

async function setConfigFromDetaBase(){
  const deta = Deta(process.env.DETA_DATA_KEY);
  const db = deta.Base("env_setting");
  const channelAccessTokenObj = await db.get("channelAccessToken");
  const channelSecretObj = await db.get("channelSecret");
  if (channelAccessTokenObj && channelSecretObj) {
    setLineConfig(channelAccessTokenObj.value, channelSecretObj.value)
  }
  return true;
}

setConfigFromDetaBase()

module.exports = {
  getLineClient: getLineClient,
  getLineConfig: getLineConfig,
  setLineConfig: setLineConfig,
  setConfigFromDetaBase: setConfigFromDetaBase
}