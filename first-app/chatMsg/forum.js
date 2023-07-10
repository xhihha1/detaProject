var express = require('express');
const multer = require('multer');
var router = express.Router();
const {
  Deta
} = require('deta');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// router.use(express.json());

// 获取所有留言
router.get('/messages', express.json(), async (req, res) => {
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

const cpUpload = upload.fields([{ name: 'photos', maxCount: 1 }])
// 创建留言
router.post('/messages', cpUpload, async (req, res) => {
  try {
    const {
      name,
      message
    } = req.body;

    const data = {
      name,
      message
    };
    const image = req.files || req.files['photos'] || req.files['photos'][0];
    const deta = Deta(process.env.DETA_DATA_KEY);
    const db = deta.Base("forum_db");

    if (image &&　image.buffer) {
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


const uploadReply = multer()
// 删除留言
router.delete('/messages/:messageId', uploadReply.none(), async (req, res) => {
  try {
    const { messageId } = req.params;
    const deta = Deta(process.env.DETA_DATA_KEY);
    const db = deta.Base("forum_db");

    await db.delete(messageId);

    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// 创建回复
router.post('/messages/:messageId/reply', uploadReply.none(), async (req, res) => {
  try {
    const {
      messageId
    } = req.params;
    const {
      name,
      message
    } = req.body;

    const data = {
      name: name,
      message: message
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