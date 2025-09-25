const multer = require("multer");

// Use memory storage to store files as Buffer in memory
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only jpg, png, pdf allowed"));
    }
    cb(null, true);
  },
});

module.exports = upload;
