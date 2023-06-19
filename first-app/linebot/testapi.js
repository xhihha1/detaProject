var express = require('express');
var router = express.Router();
const line = require('@line/bot-sdk');
const { Blob } = require('buffer');
const fs = require('fs');
const {
  Readable
} = require('stream');
const {
  Deta
} = require('deta');

const config = {
  channelAccessToken: '',
  channelSecret: ''
};
const client = new line.Client(config);

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
  const key = mediaId;
  const extension = 'jpg';
  const item = await drive.get(`${key}.${extension}`);
  const buffer = await item.arrayBuffer();
  const responseItem = Buffer.from(buffer);
  res.setHeader('Content-Type', 'image/jpeg');
  res.send(responseItem);

})

async function blobMedia (mediaId) {
  try {
    return new Promise((resolve, reject) => {
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