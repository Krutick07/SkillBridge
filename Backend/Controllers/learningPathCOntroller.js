const User = require('../Modals/userModals');
const learningPath = require('../Modals/learningPathModal');
const geminiService = require('../service/geminiService');

const generateLearningPath = async (req,res) =>{
    try{
        const {skills, userId} = req.body;

        if(!skills || skills.length == 0){
            return res.status(400).json({ message: 'Skills are required.' });
        }
        const aiResult = await geminiService.generatePath(skills);
        
        const path = new learningPath({
            user: userId,
            skillUsed: skills,
            aiGeneratedPath: aiResult
        })

        await path.save();

        res.status(200).json({ success: true , learningPath: aiResult});
    }catch(error){
        res.status(500).json({message: 'Failed to generate learning path.', error: error.message});
    }
}

module.exports = {generateLearningPath};
