const mongos = require('mongoose');

const courseSchema = new mongos.Schema({
    title: {type: String , required: true},
    description: String,
    topics: [String],
    link: String,
    level: { type: String, enum: ['Beginner','Intermediate','Advanced'], default: 'Beginner'}
}, {timestamps: true});

module.exports = mongos.model('Course',courseSchema);