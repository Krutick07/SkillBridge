const express = require('express');
const router = express.Router();
const multer = require('multer');
const {uploadResume} = require('../Controllers/resumeController');
const {protect} = require('../middleware/authMiddleware');

const upload = multer({dest: 'uploads/'});

router.post('/upload',protect,upload.single('resume'), uploadResume);

module.exports = router;