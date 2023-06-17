const fs = require('fs');
const path = require('path');
const axios = require('axios');
const line = require('@line/bot-sdk');

const config = {
    channelAccessToken: 'UznJgSBtGOui0xHCjuGkT0S2voLf130gk6vVUG3y+WJvrKkoEzuveSlj/iQnoQC4LNBJZA3uXXhXsbW7Lsyo24bBZiP2dqs2+DT7dTm4PJxb8QCM/5y7a6Tso+41y6nHeyLxvC+UjB6UFIZ3PrtvqAdB04t89/1O/w1cDnyilFU=',
    channelSecret: '1aeee41f551b41ae755323b6532b901c'
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

//   downloadMedia(459928372316209585)
async function A (){
  const r = await downloadMedia('459929690619511002')
  console.log(r)
}

A()