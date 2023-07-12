var express = require('express');
const multer = require('multer');
const mime = require("mime")
const fs = require('fs');
var router = express.Router();
const {
  Deta
} = require('deta');
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage
})

// ?page=1
router.get('/list', async (req, res) => {
  try {
    const deta = Deta(process.env.DETA_DATA_KEY);
    const drive = deta.Drive("simple_drive");
    const itemsPerPage = parseInt(req.query.size) ? parseInt(req.query.size) : 50; // 每頁顯示的項目數量
    const lastPage = req.query.last;
    const option = {
      limit: itemsPerPage
    }
    if (lastPage) { option.last = lastPage; }

    const files = await drive.list(option);

    res.json({
      files: files.names,
      pages: files.paging ? files.paging.size : files.names.length,
      last: files.paging ? files.paging.last : files.names[files.names.length - 1]
    });
  } catch (error) {
    console.error('Error retrieving files:', error);
    res.status(500).send('Internal Server Error');
  }
});

const getPhoto = async ({ file_name }) => {
  const deta = Deta(process.env.DETA_DATA_KEY);
  const drive = deta.Drive("simple_drive");
  const img = await drive.get(file_name);
  if (!img) return null;
  const buffer = await img.arrayBuffer();
  return Buffer.from(buffer);
};

router.get('/media/:file_name', async (req, res) => {
  const photo = await getPhoto({file_name: req.params.file_name})
  if (!photo) {
		res.status(404).json({error: "Photo not found"})
		return
	}
	res.set("Content-Type", mime.getType(req.params.file_name));
  res.setHeader('Cache-Control', 'no-cache');
	res.send(photo)
})


module.exports = router;