const mongos = require('mongoose');

const LearningPathSchema = new mongos.Schema({
    user: { type: mongos.Schema.Types.ObjectId, ref: 'User',required: true},
    skillUsed: [String],
    aiGeneratedPath: String,
    createdAt: { type: Date, default: Date.now}
})

module.exports = mongos.model('LearningPath',LearningPathSchema);