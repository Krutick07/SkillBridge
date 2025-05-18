const express= require('express');
const router = express.Router();

const {startMockInterview,submitMockInterview} = require('../Controllers/MockInterviewController');

router.post('/start',startMockInterview);
router.post('/submit',submitMockInterview);

module.exports = router;