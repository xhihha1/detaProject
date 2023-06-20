const fs = require('fs');
const path = require('path');
const axios = require('axios');
const line = require('@line/bot-sdk');
const { Blob } = require('buffer');

const config = {
  channelAccessToken: '',
  channelSecret: ''
};
  
const client = new line.Client(config);
async function downloadMedia (mediaId) {
    try {
      return new Promise((resolve, reject) => {
        const downloadPath = path.join(__dirname, '../page/tempMedia',`${mediaId}.jpg`);
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
                  resolve({ blob: blob, arrayBuffer: arrayBuffer})
                });
                stream.on('error', () => {reject(false)});
            })
      })
    } catch (error) {
      console.log(`下载媒体文件失败: ${error.message}`);
      return false;
    }
  };

// 廣播傳送圖片訊息函式
async function broadcastImageMessage(imageUrl) {
  try {
    const message = [{
      type: 'image',
      originalContentUrl: "https://firstdeta-1-g8734942.deta.app/lineBot/media/load/460363401131459014",
      previewImageUrl: "https://firstdeta-1-g8734942.deta.app/lineBot/media/load/460363401131459014"
    }];

    const response = await client.broadcast(message);

    console.log('圖片訊息廣播傳送成功:', response);
  } catch (error) {
    console.error('圖片訊息廣播傳送失敗:', error);
  }
}

//   downloadMedia(459928372316209585)
async function A (){
  const r = await downloadMedia('459929690619511002')
  console.log(r)
  const b = await blobMedia('459929690619511002')
  console.log(b)
  await broadcastImageMessage('https://firstdeta-1-g8734942.deta.app/lineBot/media/load/460363401131459014')
  // await broadcastImageMessage('https://firstdeta-1-g8734942.deta.app/page/asset/yui.png')
}

A()