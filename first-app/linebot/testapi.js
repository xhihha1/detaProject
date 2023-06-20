var express = require('express');
var router = express.Router();
const line = require('@line/bot-sdk');
const setting = require('./setting');
const {
  Blob
} = require('buffer');
const fs = require('fs');
const {
  Readable
} = require('stream');
const {
  Deta
} = require('deta');

// const config = {
//   channelAccessToken: '',
//   channelSecret: ''
// };

// const client = new line.Client(config);

// 获取Line媒体ID的API端点
router.get('/media/:mediaId', async (req, res) => {
  const mediaId = req.params.mediaId;
  const deta = Deta(process.env.DETA_DATA_KEY);
  const db = deta.Base(process.env.BASE_NAME || 'simple_db');

  // store objects
  await db.put({
    name: "alex",
    age: mediaId
  }, "my-key")

  const item = await db.get("my-key");
  res.send(item);

})

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

async function blobMedia(mediaId) {
  const client = setting.getLineClient()
  try {
    return new Promise((resolve, reject) => {
      client.getMessageContent(mediaId)
        .then((stream) => {
          const buffers = [];
          stream.on('data', (chunk) => {
            buffers.push(chunk);
          });
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
            resolve({
              blob: blob,
              arrayBuffer: arrayBuffer,
              buffer: buffer
            })
          });
          stream.on('error', () => {
            reject(false)
          });
        })
    })
  } catch (error) {
    console.log(`下载媒体文件失败: ${error.message}`);
    return false;
  }
};

router.get('/broadcast/:mediaId', async (req, res) => {
  const client = setting.getLineClient()
  const mediaId = req.params.mediaId;
  let result = false;
  const protocol = req.protocol;
  const host = req.get('host');
  const currentUrl = `https://${host}`;
  try {
    const message = [{
      type: 'image',
      originalContentUrl: `${currentUrl}/lineBot/media/load/${mediaId}`,
      previewImageUrl: `${currentUrl}/lineBot/media/load/${mediaId}`
    }];

    const response = await client.broadcast(message);

    console.log('圖片訊息廣播傳送成功:', response);
    result = true;
    res.status(200).json({result:result, message: message});
  } catch (error) {
    console.error('圖片訊息廣播傳送失敗:', error);
    res.status(200).json({result:result, message: error});
  }
})

module.exports = router;