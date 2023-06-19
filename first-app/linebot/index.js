const fs = require('fs');
const path = require('path');
var express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');
var router = express.Router();
const { google } = require('googleapis');
const deta = require('deta');

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

async function replyWithMediaMessage(replyToken, messageType, messageId, req) {
  const message = {
    type: messageType,
    originalContentUrl: `https://api.line.me/v2/bot/message/${messageId}/content`,
    previewImageUrl: `https://api.line.me/v2/bot/message/${messageId}/content`,
  };
  // const directoryPath = path.join(__dirname, '../page/tempMedia'); 
  // const downloadPath = path.join(__dirname, '../page/tempMedia',`${messageId}.jpg`);
  const directoryPath = path.join(__dirname); 
  const downloadPath = path.join(__dirname,`${messageId}.jpg`);
  await createDirectoryIfNotExists(directoryPath)
  await changeDirectoryPermissions(directoryPath)
  const save = await downloadMedia(messageId, downloadPath)
  if (save) {
    const protocol = req.protocol;
    const host = req.get('host');
    const currentUrl = `${protocol}://${host}`;
    // message.originalContentUrl = `${currentUrl}/page/tempMedia/${messageId}.jpg`;
    // message.previewImageUrl = `${currentUrl}/page/tempMedia/${messageId}.jpg`;
    message.originalContentUrl = `${currentUrl}/line/${messageId}.jpg`;
    message.previewImageUrl = `${currentUrl}/line/${messageId}.jpg`;
  } else {
    message.type = 'text';
    message.text = `fail download ${messageId}`
  }
  // const filePath = path.join(__dirname, '../page/tempMedia')
  // const fileList = await readDirectory(filePath)
  await client.replyMessage(replyToken, message);
  // await client.replyMessage(replyToken, lineMessage);
}

async function downloadMedia (mediaId, downloadPath) {
  try {
    return new Promise((resolve, reject) => {
      // const downloadPath = path.join(__dirname, '../page/tempMedia',`${mediaId}.jpg`);
        client.getMessageContent(mediaId)
          .then((stream) => {
              const writable = fs.createWriteStream(downloadPath);
              stream.pipe(writable);
              stream.on('end', () => {resolve(true)});
              stream.on('error', () => {reject(false)});
          })
    })
  } catch (error) {
    console.log(`下载媒体文件失败: ${error.message}`);
    return false;
  }
};

async function createDirectoryIfNotExists (directoryPath) {
  try {
    await fs.promises.access(directoryPath, fs.constants.R_OK | fs.constants.W_OK);
    console.log('目录已存在');
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      try {
        await fs.promises.mkdir(directoryPath, { recursive: true });
        console.log('目录已创建');
        return true;
      } catch (error) {
        console.error('创建目录时发生错误:', error);
        return false;
      }
    } else {
      console.error('访问目录时发生错误:', error);
      return false;
    }
  }
};

async function changeDirectoryPermissions (directoryPath) {
  const permissions = 0o777;
  try {
    await fs.promises.chmod(directoryPath, permissions);
    console.log('目录权限已成功更改');
    return true;
  } catch (error) {
    console.error('更改目录权限时发生错误:', error);
    return false;
  }
};


// 获取Line媒体ID的API端点
router.get('/media/:mediaId', async (req, res) => {
  try {
    const mediaId = req.params.mediaId;

    // 获取媒体文件的URL
    const response = await client.getMessageContent(mediaId);
    const contentType = response.headers['content-type'];
    const fileExtension = contentType.split('/')[1];
    const fileUrl = `https://api.line.me/v2/bot/message/${mediaId}/content`;

    // 使用Axios下载媒体文件
    const downloadResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const imageData = Buffer.from(downloadResponse.data, 'binary');

    // 在Deta Space中存储图像文件
    const driveResponse = await detaSpace.put(fileExtension, imageData);

    // 构建图像文件的公共URL
    const fileKey = driveResponse.key;
    const filePublicUrl = `https://FirstDeta.deta.dev/drive/${fileKey}`;

    // 返回图像文件的公共URL
    res.json({ success: true, url: filePublicUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to process media' });
  }
});


module.exports = router;