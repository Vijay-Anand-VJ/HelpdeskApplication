const multer = require("multer");
const path = require("path");

// 1. Configure Storage (Where to save files)
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "uploads/"); // Save to 'uploads' folder
    },
    filename(req, file, cb) {
        // Rename file to avoid duplicates: fieldname-timestamp.ext
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

// 2. Validate File Type (Optional: Allow images/pdfs)
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb("Images and Documents only!");
    }
}

// 3. Initialize Multer
const upload = multer({
    storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
