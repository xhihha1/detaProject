const fs = require('fs');
const path = require('path');
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
  const protocol = req.protocol;
  const host = req.get('host');
  const currentUrl = `${protocol}://${host}/page/asset/yui.png`;
  res.send(`Hello from Space line Bot! 🚀${currentUrl} <img src="${currentUrl}">`);
});

// line bot webhook can't use express.json middleware
router.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events;

    for (const event of events) {
      if (event.type === 'message') {
        if (event.message.type === 'text') {
          const message = event.message.text.toLowerCase();
          if (message.startsWith('[search]')) {
            const query = message.slice(8);
            await replyWithSearchResults(event.replyToken, query);
          } else if (message === '[info]') {
            await replyWithInfoTemplate(event.replyToken);
          } else {
            await replyWithKeywordExplanation(event.replyToken, message);
          }
        } else if (event.message.type === 'location') {
          const { title, address, latitude, longitude } = event.message;
          await replyWithMapLink(event.replyToken, title, address, latitude, longitude);
        } else if (['image', 'video', 'audio'].includes(event.message.type)) {
          await replyWithMediaMessage(event.replyToken, event.message.type, event.message.id, req);
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to process events' });
  }
});

router.get("/search", express.json(), async (req, res) => {
  if (!req.query.key) {
    res.send("Hello 🚀");
  }
  const results = await searchGoogle(req.query.key)
  res.json(results);
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
    num: 1,
  });

  const results = response.data.items;
  return results;
}


async function replyWithSearchResults(replyToken, query) {
  const message = {
    type: 'text',
    text: `https://www.google.com/search?q=${query}`,
  };

  await client.replyMessage(replyToken, message);
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

async function replyWithMapLink(replyToken, title, address, latitude, longitude) {
  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  const message = {
    type: 'text',
    text: `${title}\n${address}\n\n${mapUrl}`,
  };

  await client.replyMessage(replyToken, message);
}

async function replyWithMediaMessage(replyToken, messageType, messageId) {
  const message = {
    type: messageType,
    originalContentUrl: `https://api.line.me/v2/bot/message/${messageId}/content`,
    previewImageUrl: `https://api.line.me/v2/bot/message/${messageId}/content`,
  };

  await client.replyMessage(replyToken, message);
}

async function getMsgContent(messageId) {
  const response = await axios({
    method: 'GET',
    url: "https://api.line.me/v2/bot/message/" + messageId + "/content",
    responseType: 'stream',
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${config.channelAccessToken}`
		}
  })

  request({
		url: "https://api.line.me/v2/bot/message/" + messageId + "/content",
		method: "GET",
		json: true,
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${config.channelAccessToken}`
		}
	}, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			console.log('getMsgContent--------------------');
			//console.log(body);
			if (callbackObj) {
				callbackObj['params'].push(body);
				callbackObj['func'].apply(null, callbackObj['params']);
			}
		} else {
			console.log("error: " + error)
			console.log("response.statusCode: " + response.statusCode)
			console.log("response.statusText: " + response.statusText)
		}
	});
}

async function downloadMedia (mediaId) {
  try {
    const response = await axios.get(`https://api.line.me/v2/bot/message/${mediaId}/content`, {
      headers: {
        Authorization: `Bearer ${config.channelAccessToken}`,
      },
      responseType: 'stream',
    });

    const writer = fs.createWriteStream('downloaded_media.jpg'); // 指定要保存的文件名

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    throw new Error(`下载媒体文件失败: ${error.message}`);
  }
};

// lineApiUtil.saveMsgImage = function(binaryData) {
// 	var dateStr = new Date().getTime();
// 	var filename = dateStr + '.JPEG';
// 	var file = path.join(__dirname, '../public/', filename);
// 	fs.writeFile(file, binaryData, 'binary', function(err) {
// 		if (err)
// 			console.log(err);
// 		else
// 			console.log("The file was saved!");
// 	});
// }

async function replyWithMediaMessage_backup(replyToken, messageType, messageId, req) {
  const protocol = req.protocol;
  const host = req.get('host');
  const currentUrl = `${protocol}://${host}`;
  const response = await client.getMessageContent(messageId);

  if (response.headers['content-type'].startsWith('image/') ||
      response.headers['content-type'].startsWith('video/') ||
      response.headers['content-type'].startsWith('audio/')) {
    const ext = response.headers['content-type'].split('/')[1];
    const filename = `${messageId}.${ext}`;
    const filePath = path.join(__dirname, '../page/tempMedia', filename);

    const writeStream = fs.createWriteStream(filePath);
    // response.data.pipe(writeStream);
    response.pipe(writeStream);

    // // `https://api.line.me/v2/bot/message/${messageId}/content`
    writeStream.on('finish', () => {
      const message = {
        type: messageType,
        originalContentUrl: `${currentUrl}/page/tempMedia/${filename}`,
        previewImageUrl: `${currentUrl}/page/tempMedia/${filename}`,
      };

      client.replyMessage(replyToken, message);
    });

    writeStream.on('error', (error) => {
      console.error(error);
      client.replyMessage(replyToken, { type: 'text', text: 'Failed to save media file' });
    });
    client.replyMessage(replyToken, { type: 'text', text: `_A_:${filename},_B_:${filePath},_C_:${currentUrl}/page/tempMedia/${filename}` });
  } else {
    client.replyMessage(replyToken, { type: 'text', text: 'Unsupported media type' });
  }
}

module.exports = router;