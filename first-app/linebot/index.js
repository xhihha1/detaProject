const fs = require('fs');
const path = require('path');
var express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');
var router = express.Router();
const { google } = require('googleapis');
const { Blob } = require('buffer');
const setting = require('./setting');
const {
  Deta
} = require('deta');

// const config = {
//   channelAccessToken: '',
//   channelSecret: ''
// };


// 發送訊息到 '<USER_ID>' 
const channellUserID = '';

const googleAPIKey = '';
const googleSearchEngineId = '';



// const client = new line.Client(config);


router.get("/", (req, res) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const currentUrl = `${protocol}://${host}/page/asset/yui.png`;
  res.send(`Hello from Space line Bot! 🚀${currentUrl} <img src="${currentUrl}">`);
});

function lineBotMiddleware(req, res, next) {
  const config = setting.getLineConfig()
  if (!config) {
    res.status(403).send('Access line config denied');
  }
  // 使用 line.middleware 驗證 LINE Bot 請求
  line.middleware(config)(req, res, next);
}

// line bot webhook can't use express.json middleware
// router.post('/webhook', line.middleware(config), async (req, res) => {
router.post('/webhook', lineBotMiddleware, async (req, res) => {
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
            await replyWithKeywordExplanation(event.replyToken, message, event);
          }
        } else if (event.message.type === 'location') {
          const { title, address, latitude, longitude } = event.message;
          await replyWithMapLink(event.replyToken, title, address, latitude, longitude);
        } else if (['image', 'video', 'audio'].includes(event.message.type)) {
          console.log(`reply: ${event.message.type}`)
          await replyWithMediaMessage(event.replyToken, event.message, event.message.type, event.message.id, req);
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
  const client = setting.getLineClient()
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

router.get('/send-line-broadcast-message/:msg', express.json(), (req, res) => {
  const msg = req.params.msg;
  const client = setting.getLineClient()

  // 创建广播消息对象
  const broadcastMessage = {
    messages: [
      {
        type: 'text',
        text: msg,
      }
    ]
  };

  // 使用您的Line Bot的 Channel Access Token 发送广播消息
  client.broadcast(broadcastMessage)
    .then(() => {
      res.json({ success: true });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to send message', msg: error });
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
  const client = setting.getLineClient()
  const message = {
    type: 'text',
    text: `https://www.google.com/search?q=${query}`,
  };

  await client.replyMessage(replyToken, message);
}


async function replyWithInfoTemplate(replyToken) {
  const client = setting.getLineClient()
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

async function replyWithKeywordExplanation(replyToken, keyword, event) {
  const client = setting.getLineClient()
  const userId = event && event.source && event.source.userId || 'None';
  const message = {
    type: 'text',
    text: `Explanation for keyword "${keyword}" goes here. User: ${userId}`,
  };

  await client.replyMessage(replyToken, message);
}

async function replyWithMapLink(replyToken, title, address, latitude, longitude) {
  const client = setting.getLineClient()
  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  const message = {
    type: 'text',
    text: `${title}\n${address}\n\n${mapUrl}`,
  };

  await client.replyMessage(replyToken, message);
}

async function replyWithMediaMessage(replyToken, message, messageType, messageId, req) {
  const client = setting.getLineClient()
  const protocol = req.protocol;
  const host = req.get('host');
  const currentUrl = `https://${host}`;
  const deta = Deta(process.env.DETA_DATA_KEY);
  // const db = deta.Base(process.env.BASE_NAME || 'simple_db');
  const drive = deta.Drive("simple_drive");
  const db = deta.Base("simple_db");

  const responseData = await blobMedia(messageId)
  let key = messageId;
  let extension = '';
  let messageResponse = {};
  if (messageType === 'image') {
    extension = 'jpg';
    messageResponse = [{
      type: 'image',
      originalContentUrl: `${currentUrl}/lineBot/media/load/${messageId}`,
      previewImageUrl: `${currentUrl}/lineBot/media/load/${messageId}`
    }];
  }
  if (messageType === 'video') {
    extension = 'mp4';
    messageResponse = [{
      type: 'video',
      originalContentUrl: `${currentUrl}/lineBot/media/load/${messageId}`,
      previewImageUrl: `${currentUrl}/page/asset/yui.png`
    }];
  }
  if (messageType === 'audio') {
    extension = 'm4a';
    messageResponse = [{
      type: 'audio',
      originalContentUrl: `${currentUrl}/lineBot/media/load/${messageId}`,
      duration: message.duration
    }];
  }
  if (responseData) {
    const driveItem = await drive.put(`${key}.${extension}`, {
      data: responseData.buffer,
    });
    const mediaObj = {
      ext: extension,
      duration: message.duration
    }
    await db.put(mediaObj, messageId)
  } else {
    messageResponse = [{
      type: 'text',
      text: `fail download ${messageId}`
    }];
  }
  // const response = await client.broadcast(messageResponse);
  await client.replyMessage(replyToken, messageResponse);
}


// 获取Line媒体ID的並儲存
router.get('/media/save/:mediaId', async (req, res) => {
  const mediaId = req.params.mediaId;
  const deta = Deta(process.env.DETA_DATA_KEY);
  // const db = deta.Base(process.env.BASE_NAME || 'simple_db');
  const drive = deta.Drive("simple_drive");

  const responseData = await blobMedia(mediaId)
  let key = '';
  let extension = '';
  if (responseData) {
    key = mediaId;
    extension = 'jpg';
    const driveItem = await drive.put(`${key}.${extension}`, {
      data: responseData.buffer,
    });
  } else {

  }

  const item = await drive.get(`${key}.${extension}`);
  const buffer = await item.arrayBuffer();
  const responseItem = Buffer.from(buffer);
  res.setHeader('Content-Type', 'image/jpeg');
  res.send(responseItem);

})

// 讀取已存的媒體
router.get('/media/load/:mediaId', async (req, res) => {
  const mediaId = req.params.mediaId;
  const deta = Deta(process.env.DETA_DATA_KEY);
  const drive = deta.Drive("simple_drive");
  const db = deta.Base("simple_db");
  let extension = 'jpg';
  let contentType = 'image/jpeg';
  const mediaExtItem = await db.get(mediaId); 
  if (mediaExtItem && mediaExtItem.ext) {
    extension = mediaExtItem.ext;
  }
  if (extension === 'mp4') {
    contentType = 'video/mp4';
  }
  if (extension === 'm4a') {
    contentType = 'audio/m4a';
  }
  const item = await drive.get(`${mediaId}.${extension}`);
  const buffer = await item.arrayBuffer();
  const responseItem = Buffer.from(buffer);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('content-type', contentType);
  res.set('content-type', contentType);
  if (extension !== 'jpg') {
    // 設置檔案名稱和附檔名
    const contentDisposition = `attachment; filename=${mediaId}.${extension}`;
    res.setHeader('Content-Disposition', contentDisposition);
  }
  res.status(200).send(responseItem);
})

async function blobMedia (mediaId) {
  const client = setting.getLineClient()
  console.log('--- blobMedia --- ')
  try {
    return new Promise((resolve, reject) => {
      console.log('--- blobMedia --- in')
        client.getMessageContent(mediaId)
          .then((stream) => {
            const buffers = [];
              stream.on('data', (chunk) => {buffers.push(chunk);});
              stream.on('end', () => {
                // 合并所有Buffer为一个Buffer
                const buffer = Buffer.concat(buffers);
                // 将Buffer转换为Blob
                const blob = new Blob([buffer], {
                    type: 'application/octet-stream'
                });
                // 将Buffer转换为ArrayBuffer
                const arrayBuffer = buffer.buffer;
                // 在这里可以对blob或arrayBuffer进行进一步处理
                resolve({ blob: blob, arrayBuffer: arrayBuffer, buffer: buffer})
              });
              stream.on('error', () => {reject(false)});
          })
    })
  } catch (error) {
    console.log(`下载媒体文件失败: ${error.message}`);
    return false;
  }
};


module.exports = router;