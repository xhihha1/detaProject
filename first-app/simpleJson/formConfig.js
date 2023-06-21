var express = require('express');
var router = express.Router();
const axios = require('axios');
const {
  Deta
} = require('deta');
// router.use(express.json());
const setting = require('../linebot/setting');
var keyString = require('./keyString');

router.post('/submitConfig', express.json(), async (req, res) => {
  const {
    channelAccessToken,
    channelSecret,
    channelUserID,
    googleAPIKey,
    googleSearchEngineId
  } = req.body;
  const deta = Deta(process.env.DETA_DATA_KEY);
  const db = deta.Base("env_setting");
  try {
    await dbPut(db, keyString.line.Channel_Access_Token, {
      value: channelAccessToken
    })
    await dbPut(db, keyString.line.Channel_Secret, {
      value: channelSecret
    })
    await dbPut(db, keyString.line.Channel_User_Id, {
      value: channelUserID
    })
    await dbPut(db, keyString.google.googleAPIKey, {
      value: googleAPIKey
    })
    await dbPut(db, keyString.google.googleSearchEngineId, {
      value: googleSearchEngineId
    })
    setting.setConfigFromDetaBase()
    // res.send('表單提交成功！');
    // 使用 axios 發送 GET 請求
    // const protocol = req.protocol;
    // const host = req.get('host');
    // const currentUrl = `${protocol}://${host}/lineBot/setting`;
    // const response = await axios.get('/');
    res.json(req.body);
  } catch (error) {
    res.json({ success: false, error: error });
  }
  res.end();
});

router.get('/getConfig', express.json(), async (req, res) => {
  const deta = Deta(process.env.DETA_DATA_KEY);
  const db = deta.Base("env_setting");
  const channelAccessToken = await db.get(keyString.line.Channel_Access_Token);
  const channelSecret = await db.get(keyString.line.Channel_Secret);
  const channelUserID = await db.get(keyString.line.Channel_User_Id);
  const googleAPIKey = await db.get(keyString.google.googleAPIKey);
  const googleSearchEngineId = await db.get(keyString.google.googleSearchEngineId);
  res.json({
    channelAccessToken: channelAccessToken? channelAccessToken.value : '',
    channelSecret: channelSecret? channelSecret.value : '',
    channelUserID: channelUserID? channelUserID.value : '',
    googleAPIKey: googleAPIKey? googleAPIKey.value : '',
    googleSearchEngineId: googleSearchEngineId? googleSearchEngineId.value : ''
  });
})

async function dbPut(db, key, value) {
  try {
    if (typeof value.value !== 'undefined') {
      await db.put(value, key)
    }
    return true;
  } catch (error) {
    return false;
  }
}


module.exports = router;