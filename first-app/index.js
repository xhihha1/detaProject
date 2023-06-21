const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const cors = require('cors')
const line = require('@line/bot-sdk');
const expressWs = require('express-ws');
const WebSocket = require('ws');
const path = require('path');

const routes = require('./simpleJson/index');
const formConfig = require('./simpleJson/formConfig');
const linebot = require('./linebot/index');
const testbot = require('./linebot/testapi');
const chatMsg = require('./chatMsg/index');

const wsInstance = expressWs(app);

app.use(cors())
app.use('/lineBot', linebot); // line bot webhook can't use express.json
app.use('/testBot', testbot);
app.use('/formConfig', formConfig);
app.use('/chatMsg', chatMsg);


// 将指定的目录设置为静态目录
app.use('/page', express.static('page'));
app.use('/line', express.static('linebot'));

// app.use(express.json());
app.use('/simpleJson', routes);

app.get("/", (req, res) => {
  res.send("Hello from Space! 🚀");
});

// WebSocket endpoint
const clients = [];
app.ws('/ss', (ws, req) => {
  clients.push(ws);

  // Handle incoming WebSocket messages
  ws.on('message', (message) => {
    // Broadcast the message to all clients
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Handle WebSocket disconnection
  ws.on('close', () => {
    const index = clients.indexOf(ws);
    if (index > -1) {
      clients.splice(index, 1);
    }
  });
});

// ----------------------
// WebSocket endpoint 2 - /ws
const clients2 = [];
const wss2 = new WebSocket.Server({ noServer: true });
app.use('/ws', (req, res) => {
  wss2.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect);
});

function onConnect(ws) {
  clients2.push(ws);

  // Handle incoming WebSocket messages
  ws.on('message', (message) => {
    // Broadcast the message to all clients of server 2
    clients2.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Handle WebSocket disconnection
  ws.on('close', () => {
    const index = clients2.indexOf(ws);
    if (index > -1) {
      clients2.splice(index, 1);
    }
  });
}


app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
