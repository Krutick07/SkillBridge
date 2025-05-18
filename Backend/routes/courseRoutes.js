const express = require('express');
const {protect,adminOnly} = require('../middleware/authMiddleware');

const {createCourse,updateCourse,getCourse,getCourseById,deleteCourse} = require('../Controllers/courseController');

const router = express.Router();

router.get('/',getCourse);
router.get('/:id',getCourseById);

router.post('/',protect,adminOnly,createCourse);
router.put('/:id',protect,adminOnly,updateCourse);
router.delete('/:id', protect,adminOnly,deleteCourse);

module.exports = router; 
