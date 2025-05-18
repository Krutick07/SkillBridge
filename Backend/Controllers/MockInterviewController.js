const MockInterview = require('../Modals/MockinterviewModal');
const GeminiService = require('../service/geminiService');

exports.startMockInterview = async (req, res) => {
    const {role} = req.body;
    try{
        const questions = await GeminiService.generateMockInterview(role);
        res.status(200).json({ questions });
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

exports.submitMockInterview = async (req,res) => {
    const { user, role, qaPairs } = req.body;
    try{
        const feedbacktext = await GeminiService.evaluteAns(qaPairs);

        const result = [];
        // const pattern = /Question\s\d+:\sAnswer\s\d+:\s(.*?)\nScore:\s?(\d+)\nFeedback:\s?(.*?)(?=\nQuestion\s\d+:|$)/gs;

        const pattern = /Question\s\d+:\s(.*?)\nAnswer\s\d+:\s(.*?)\nScore:\s?(\d+)\nFeedback:\s?(.*?)(?=\nQuestion\s\d+:|$)/gs;

        let match;
        while((match = pattern.exec(feedbacktext)) != null){
            const [,question,userAnswer,score,feedback] = match;
            result.push({
                question: question.trim(),
                userAnswer: userAnswer.trim(),
                feedback: feedback.trim(),
                score: parseInt(score)
            });
        }
        const interviewRecord =new MockInterview({
            user,
            jobRole: role,
            questions: result,
            date: new Date(),
        });

        await interviewRecord.save();

        res.status(201).json({message: 'Mock interview saved', result});
    }catch(error){
        res.status(500).json({error: error.message});
    }
}