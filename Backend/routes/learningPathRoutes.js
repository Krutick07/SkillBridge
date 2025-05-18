const express = require('express');
const {protect} = require('../middleware/authMiddleware')
const { generateLearningPath} = require('../Controllers/learningPathCOntroller');

const Router = express.Router();

Router.post('/', protect,generateLearningPath);

module.exports =Router;