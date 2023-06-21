const express = require('express');
// const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 4501;

app.use(express.static('public'));
app.use(express.json());
// SSE clients
const clients = new Map();

// Send message to all clients
function sendMessageToClients(message) {
  for (const client of clients.values()) {
    client.res.write(`data: ${JSON.stringify(message)}\n\n`);
  }
}
// Server-Sent Events (SSE) endpoint
app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Handle SSE connections
  function handleSSEConnection(req, res) {
    const clientId = uuidv4();
    const newClient = { id: clientId, res };

    clients.set(clientId, newClient);

    req.on('close', () => {
      clients.delete(clientId);
    });
  }

  handleSSEConnection(req, res);
});

// Handle incoming chat messages
app.post('/message', (req, res) => {
  const { message } = req.body;

  // Broadcast message to all clients
  sendMessageToClients({ type: 'text', content: message });

  res.sendStatus(200);
});

// Handle incoming image uploads
app.post('/image', (req, res) => {
  const { image } = req.body;

  // Broadcast image data to all clients
  sendMessageToClients({ type: 'image', content: image });

  res.sendStatus(200);
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});