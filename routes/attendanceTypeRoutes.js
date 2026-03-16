const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { markGeneral, postWard, getMy, getAll, verify, dismiss } = require('../controllers/attendanceTypeController');
const { protect, authorize } = require('../middleware/authMiddleware');

const { storage } = require('../config/cloudinary');

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Images only!'));
    }
  }
});

router.post('/general', protect, authorize('student'), markGeneral);
router.post('/ward', protect, authorize('ward'), upload.single('photo'), postWard);
router.get('/my', protect, getMy);
router.get('/all', protect, authorize('admin'), getAll);
router.patch('/:id/verify', protect, authorize('admin'), verify);
router.patch('/:id/dismiss', protect, authorize('admin'), dismiss);

module.exports = router;