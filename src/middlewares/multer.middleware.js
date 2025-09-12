import multer from 'multer';

// we have 2 options- diskstorage or memory 
// we use disk storage to keep memory empty

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage: storage })