const line = require('@line/bot-sdk');

let client;

const config = {
  channelAccessToken: '',
  channelSecret: ''
};

function getLineClient () {
    client = new line.Client(config);
    return client;
}

function getLineConfig () {
    return config;
}

module.exports = {
    getLineClient: getLineClient,
    getLineConfig: getLineConfig
}