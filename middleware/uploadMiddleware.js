const multer = require("multer");

// Store file temporarily in memory
const storage = multer.memoryStorage();

// File Filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only Image Files Allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;