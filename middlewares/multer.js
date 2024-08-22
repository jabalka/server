const multer = require('multer');
const path = require('path');

// set up storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cd){
        cd(null, 'uploads/profilePics/');
    },
    filename: function (Req, file, cd){
        cd(null, `${Date.now()}-${file.originalname}`) // using timestamp and original filename
    }
});

// file filter to allow only certain file types
const fileFilter = (req, file, cd) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if(mimeType && extname){
        return cd(null, true);
    } else {
        cd(new Error('Only image files are allowed!'));
    }
};

//set up multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 1024 * 1024 * 5} // limit files to 5MB
});

module.exports = upload;


