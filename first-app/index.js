const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const cors = require('cors')
const line = require('@line/bot-sdk');

const routes = require('./simpleJson/index');
const linebot = require('./linebot/index');

app.use(cors())
app.use('/lineBot', linebot); // line bot webhook can't use express.json

// 将指定的目录设置为静态目录
app.use('/page', express.static('page'));
app.use('/line', express.static('linebot'));

// app.use(express.json());
app.use('/simpleJson', routes);

app.get("/", (req, res) => {
  res.send("Hello from Space! 🚀");
});


const config = {
  channelAccessToken: '',
  channelSecret: ''
};

app.post('/webhook', line.middleware(config), (req, res) => {
  console.log('--- In webhook ---')
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});
const client = new line.Client(config);
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: event.message.text
  });
}




app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
