var express = require('express');
var router = express.Router();

router.use(express.json());

router.post('/submitConfig', (req, res) => {
  const {
    channelAccessToken,
    channelSecret,
    googleAPIKey,
    googleSearchEngineId
  } = req.body;

  console.log('Channel Access Token:', channelAccessToken);
  console.log('Channel Secret:', channelSecret);
  console.log('Google API Key:', googleAPIKey);
  console.log('Google Search Engine ID:', googleSearchEngineId);

  res.send('表單提交成功！');
});