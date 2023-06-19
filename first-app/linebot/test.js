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

//   downloadMedia(459928372316209585)
async function A (){
  const r = await downloadMedia('459929690619511002')
  console.log(r)
  const b = await blobMedia('459929690619511002')
  console.log(b)
}

A()