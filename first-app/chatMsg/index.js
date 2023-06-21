var express = require('express');
var router = express.Router();
const {
  v4: uuidv4
} = require('uuid');

router.use(express.json());
// SSE clients
const clients = new Map();

// Send message to all clients
function sendMessageToClients(message) {
  for (const client of clients.values()) {
    client.res.write(`data: ${JSON.stringify(message)}\n\n`);
  }
}

// Server-Sent Events (SSE) endpoint
router.get('/sse', (req, res) => {
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
router.post('/message', (req, res) => {
  const { message } = req.body;

  // Broadcast message to all clients
  sendMessageToClients({ type: 'text', content: message });

  res.sendStatus(200);
});

// Handle incoming image uploads
router.post('/image', (req, res) => {
  const { image } = req.body;

  // Broadcast image data to all clients
  sendMessageToClients({ type: 'image', content: image });

  res.sendStatus(200);
});

module.exports = router;