var express = require('express');
const multer = require('multer');
const mime = require("mime")
var router = express.Router();
const PDFKitDocument = require('pdfkit');
const pdfLib = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const {
  Deta
} = require('deta');
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage
})

const cpUpload = upload.fields([{
  name: 'images',
  maxCount: 30
}])
// 處理圖片上傳及生成 PDF 的路由
router.post('/convert', cpUpload, (req, res) => {
  const files = req.files;
  // const pdfPath = path.join(__dirname, 'public', 'output.pdf');
  const pdfPath = path.join('/tmp', 'public', 'output.pdf');
  if (req.files && req.files['images']) {
    const files = req.files['images'];
    // Custom sort function to sort files numerically based on original names
    const pdf = new PDFKitDocument();
    files.sort((a, b) => {
      const fileAIndex = parseInt(a.originalname);
      const fileBIndex = parseInt(b.originalname);
      return fileAIndex - fileBIndex;
    });

    res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');
    pdf.pipe(res);

    files.forEach((file) => {
      pdf.image(file.buffer, {
        fit: [600, 800],
        align: 'center',
        valign: 'center'
      });
      pdf.addPage();
    });

    pdf.end();
  } else {
    res.status(500).json({
      error: 'Failed load images'
    });
  }

});


const cpUploadpdfs = upload.fields([{
  name: 'pdfs',
  maxCount: 30
}])
// Handle the PDF merge route
router.post('/merge', cpUploadpdfs, async (req, res) => {
  try {
    // const { files } = req;
    const mergedPdf = await pdfLib.PDFDocument.create();
    let files;
    if (req.files && req.files['pdfs']) {
      files = req.files['pdfs'];
    }

    for (const file of files) {
      const pdfBytes = file.buffer;
      const pdfDoc = await pdfLib.PDFDocument.load(pdfBytes);
      const pdfPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pdfPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const mergedPdfPath = 'merged.pdf';

    await fs.promises.writeFile(mergedPdfPath, mergedPdfBytes);

    res.download(mergedPdfPath, 'merged.pdf', () => {
      fs.unlinkSync(mergedPdfPath);
    });
  } catch (err) {
    console.error('Error merging PDFs:', err);
    res.status(500).send('Error merging PDFs');
  }
});


module.exports = router;