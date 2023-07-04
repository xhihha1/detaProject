var express = require('express');
var router = express.Router();
const {
  Deta
} = require('deta');

router.use(express.json());

// 获取所有留言
router.get('/messages', async (req, res) => {
  try {
    const deta = Deta(process.env.DETA_DATA_KEY);
    const db = deta.Base("forum_db");
    // const messages = await db.fetch().next();
    let messages = await db.fetch();
    let allItems = messages.items;

    // Continue fetching until "messages.last" is undefined.
    while (messages.last) {
      messages = await db.fetch({}, { last: messages.last });
      allItems = allItems.concat(messages.items);
    }
    res.json(allItems);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      error: 'Failed to fetch messages'
    });
  }
});

// 创建留言
router.post('/messages', async (req, res) => {
  try {
    const {
      name,
      message,
      image
    } = req.body;

    const data = {
      name,
      message
    };
    const deta = Deta(process.env.DETA_DATA_KEY);
    const db = deta.Base("forum_db");

    if (image) {
      const imageFile = await db.put(image.buffer);
      data.image = imageFile.key;
    }

    const newMessage = await db.put(data);

    res.json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      error: 'Failed to create message'
    });
  }
});

// 创建回复
router.post('/messages/:messageId/reply', async (req, res) => {
  try {
    const {
      messageId
    } = req.params;
    const {
      name,
      message
    } = req.body;

    const data = {
      name,
      message
    };

    const deta = Deta(process.env.DETA_DATA_KEY);
    const db = deta.Base("forum_db");

    const messageData = await db.get(messageId);
    if (!messageData) {
      return res.status(404).json({
        error: 'Message not found'
      });
    }

    if (!messageData.replies) {
      messageData.replies = [];
    }

    messageData.replies.push(data);

    const updatedMessage = await db.put(messageData);

    res.json(data);
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({
      error: 'Failed to create reply'
    });
  }
});


module.exports = router;