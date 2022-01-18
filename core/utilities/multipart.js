let multer = require('multer');
let path = require('path');
const { v1: uuidv1 } = require('uuid');

let temporaryStorage = multer.memoryStorage();
exports.tempUploader = multer({ storage: temporaryStorage });

exports.fileUploader = (folder_path) => {
    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, folder_path);
        },
        filename: function (req, file, cb) {
            cb(null, uuidv1() + path.extname(file.originalname));
        },
    });
    return multer({ storage: storage });
}

exports.bufferImageUpload = async (fileBuffer, folder) => {
    try {
        let image = await jimp.read(fileBuffer);
        let extension = image.getExtension();
        let fileName = uuidv1() + "." + extension;
        let originalPath = "uploads/" + folder + "/original/" + fileName;
        image.quality(80).write(originalPath);
        console.log("->Converted from image buffer to image Complete.");
        let output = { response: "success", original: originalPath };
        return output;
    } catch (err) {
        console.log("->Error In Image Buffer storing!");
        console.log(err.message);
        return { response: "failed" };
    }
}