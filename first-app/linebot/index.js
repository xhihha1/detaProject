var express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');
var router = express.Router();
const { google } = require('googleapis');

const config = {
  channelAccessToken: '',
  channelSecret: ''
};

// 發送訊息到 '<USER_ID>' 
const channellUserID = '';

const googleAPIKey = '';
const googleSearchEngineId = '';

const client = new line.Client(config);

router.get("/", (req, res) => {
  res.send("Hello from Space line Bot! 🚀");
});

// line bot webhook can't use express.json middleware
router.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events;

    for (const event of events) {
      if (event.type !== 'message' || event.message.type !== 'text') {
        continue;
      }

      const message = event.message.text.toLowerCase();

      if (message.startsWith('[search]')) {
        const query = message.slice(8);
        const results = await searchGoogle(query);
        await replyWithSearchResults(event.replyToken, results);
      } else if (message === '[info]') {
        await replyWithInfoTemplate(event.replyToken);
      } else {
        await replyWithKeywordExplanation(event.replyToken, message);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to process events' });
  }
});



router.post('/send-line-bot-message', express.json(), (req, res) => {
  const { message } = req.body;
  
  // 发送文字消息到Line Bot
  const lineMessage = {
    type: 'text',
    text: message,
  };
  
  // 使用您的Line Bot的 Channel Access Token 发送消息
  client.pushMessage(channellUserID, lineMessage)
    .then(() => {
      res.json({ success: true });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to send message' });
    });
});

router.post('/send-line-broadcast-message', express.json(), (req, res) => {
  const { message } = req.body;

  // 创建广播消息对象
  const broadcastMessage = {
    messages: [
      {
        type: 'text',
        text: message,
      },
    ],
  };

  // 使用您的Line Bot的 Channel Access Token 发送广播消息
  client.broadcast(broadcastMessage)
    .then(() => {
      res.json({ success: true });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to send message' });
    });
});


function handleEvent(event) {
}

async function searchGoogle(query) {
  const apiKey = googleAPIKey;
  const searchEngineId = googleSearchEngineId;

  const customsearch = google.customsearch('v1');

  const response = await customsearch.cse.list({
    cx: searchEngineId,
    q: query,
    auth: apiKey,
    num: 10,
  });

  const results = response.data.items;
  return results;
}

async function replyWithSearchResults(replyToken, results) {
  // const messages = results.map((result) => ({
  //   type: 'text',
  //   text: result.title + '\n' + result.link,
  // }));
  let columns = []
  let object = {}
  for (let i = 0; i < results.length; i++) {
    if (i % 3 === 0) {
      object = {
        text: 'Search Page:' + (Math.floor(i / 3) + 1),
        actions: []
      }
    }
    object.actions.push({
      type: 'url',
      label: results[i].title,
      uri: results[i].link
    })
    if (i % 3 === 2) {
      columns.push(object)
    }
  }
  columns = results.map((result) => ({
    type: 'text',
    text: result.title + '\n' + result.link,
  }));

  const messages = {
    type: 'template',
    altText: 'Info',
    template: {
      type: 'carousel',
      columns: columns
    }
  }

  return client.replyMessage(replyToken, messages);
}

async function replyWithInfoTemplate(replyToken) {
  const message = {
    type: 'template',
    altText: 'Info',
    template: {
      type: 'carousel',
      columns: [{
          thumbnailImageUrl: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
          title: 'Google',
          text: 'Visit Google',
          actions: [{
            type: 'uri',
            label: 'Open',
            uri: 'https://www.google.com/',
          }, ],
        },
        {
          thumbnailImageUrl: 'https://www.yahoo.com/s/rn/seo/ht/images/yahoo.png',
          title: 'Yahoo',
          text: 'Visit Yahoo',
          actions: [{
            type: 'uri',
            label: 'Open',
            uri: 'https://www.yahoo.com/',
          }, ],
        },
      ],
    },
  };

  return client.replyMessage(replyToken, message);
}

async function replyWithKeywordExplanation(replyToken, keyword) {
  const message = {
    type: 'text',
    text: `Explanation for keyword "${keyword}" goes here`,
  };

  await client.replyMessage(replyToken, message);
}

module.exports = router;