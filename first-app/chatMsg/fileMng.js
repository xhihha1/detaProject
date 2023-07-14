var express = require('express');
const multer = require('multer');
const mime = require("mime")
const fs = require('fs');
const path = require("path");
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
    if (lastPage) {
      option.last = lastPage;
    }

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

const getPhoto = async ({
  file_name
}) => {
  const deta = Deta(process.env.DETA_DATA_KEY);
  const drive = deta.Drive("simple_drive");
  const img = await drive.get(file_name);
  if (!img) return null;
  const buffer = await img.arrayBuffer();
  return Buffer.from(buffer);
};
const deletePhoto = async ({
  file_name
}) => {
  const deta = Deta(process.env.DETA_DATA_KEY);
  const drive = deta.Drive("simple_drive");
  const db = deta.Base("simple_db");
  const removedExtension = file_name.replace(/\.[^.]*$/, "");
  try {
    await drive.delete(file_name);
    await db.delete(removedExtension);
  } catch (err) {
    console.error(err);
  }
  return true;
};

router.get('/media/:file_name', async (req, res) => {
  const photo = await getPhoto({
    file_name: req.params.file_name
  })
  if (!photo) {
    res.status(404).json({
      error: "Photo not found"
    })
    return
  }
  res.set("Content-Type", mime.getType(req.params.file_name));
  res.setHeader('Cache-Control', 'no-cache');
  res.send(photo)
})

router.delete('/media/:file_name', async (req, res) => {
  const status = await deletePhoto({
    file_name: req.params.file_name
  })
  res.setHeader('Cache-Control', 'no-cache');
  res.send({
    status
  })
})

const savePhoto = async (photo, duration) => {
  const deta = Deta(process.env.DETA_DATA_KEY);
  const drive = deta.Drive("simple_drive");
  const db = deta.Base("simple_db");
  let key;
  try {
    // const extension = path.extname(photo.originalname).toLowerCase();
    const extension = photo.originalname.match(/\.([^.]*)$/)[1].toLowerCase();
    const removedExtension = photo.originalname.replace(/\.[^.]*$/, "");
    const baseItem = await db.put({
      ext: extension,
      duration: duration
    });
    key = baseItem.key;
    // const drive_name = `${baseItem.key}${extension}`;
    // await db.update(
    //   {
    //     id: key,
    //     drive_name,
    //     url: `/photo/${drive_name}`,
    //     thumbnail: `/photo/thumbnail_${drive_name}`,
    //   },
    //   key
    // );
    const driveItem = await drive.put(`${key}.${extension}`, {
      data: photo.buffer,
    });

    // let thumbnail;
    // if (extension === ".gif") {
    //   thumbnail = await sharp(photo.data, { animated: true })
    //     .resize({ width: 120, height: 120 })
    //     .gif()
    //     .toBuffer();
    // } else if ([".svg", ".webp"].includes(extension)) {
    //   thumbnail = photo.data;
    // } else {
    //   thumbnail = await sharp(photo.data)
    //     .resize({ width: 300, height: 200, fit: "cover", background: "white" })
    //     .jpeg({
    //       quality: 75,
    //       progressive: true,
    //       chromaSubsampling: "4:4:4",
    //     })
    //     .toBuffer();
    // }
    // await drive.put(`thumbnail_${key}${extension}`, { data: thumbnail });
  } catch (err) {
    console.error(err);
    if (key) await db.delete(key);
    return false;
  }
  return true;
};

const cpUpload = upload.fields([{
  name: 'media',
  maxCount: 1
}])
router.post("/media", cpUpload, async (req, res) => {
  // const photo = await savePhoto(req.files.photo)
  let image = '';
  let status = false;
  if (req.files && req.files['media'] && req.files['media'][0]) {
    image = req.files['media'][0]
  }
  if (image && image.buffer) {
    status = await savePhoto(image, req.body.duration)
  }
  res.json({
    status
  })
})


module.exports = router;