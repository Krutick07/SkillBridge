const mongos = require('mongoose');

const resumeAnalyzeSchema = new mongos.Schema({
    feedback: {type: String , required: true},
    parsedText: String,
    resumeUrl: String
}, {timestamps: true});

module.exports = mongos.model('resumeDate',resumeAnalyzeSchema);