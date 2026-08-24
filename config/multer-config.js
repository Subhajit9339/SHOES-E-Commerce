const multer = require('multer');

// productModel.image is a Buffer, so we keep the file in memory
// (req.file.buffer) instead of writing it to disk.
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

module.exports = upload;
