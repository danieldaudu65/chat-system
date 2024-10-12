
// for converting to smaller image size
const multer = require('multer') // file upload in strings
const path = require('path')



module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if(ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".gif" && ext !== ".mkv" && ext !== ".mp4"){
            cb(new Error("File type is not supported"), false);
            return;
        }
        cb(null, true);
    }
}); 