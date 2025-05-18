const { GoogleGenerativeAI } = require('@google/generative-ai');
const { learningPathprompt } = require('../utils/promptTemplates');
require('dotenv').config();

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generatePath(skills) {
    try {
      const prompt = learningPathprompt(skills);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error('Failed to generate learning path: ' + error.message);
    }
  }

  async analyzeResume(resumeText) {
    try {
      const prompt = `Here is the resume text:\n"${resumeText}"\n\nProvide detailed feedback on formatting, missing skills, and improvement areas.`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const feedback = response.candidates?.[0]?.content?.parts?.[0]?.text || 'No feedback generated';
      return feedback;
    } catch (error) {
      throw new Error('Failed to analyze resume: ' + error.message);
    }
  }  

  async generateMockInterview(role){
    try{
      const prompt = `Generate the 5 technical interview questions for a ${role}. Format then as a numbered list.`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      // console.log('Full Gemini response:', JSON.stringify(response, null, 2));
      const questions = response.candidates?.[0]?.content?.parts?.[0]?.text || 'No questions generated.';
      console.log(questions);
      return questions;
    }catch (error){
      throw new Error('Failed to generate MockInterview:' + error.message);
    }
  }

  async evaluteAns(qaPairs){
    try{
      const prompt = `
        You are an AI interviewer. Evaluate the following answers to technical interview questions.

        Provide:
        - A score from 0 to 10 for each answer based on relevance, accuracy, and clarity.
        - A brief explanation for each score.

        Format:
        Question 1: <question>
        Answer 1: <userAnswer>
        Score: X
        Feedback: <your feedback>

        ${qaPairs.map((pair, index) => `
        Question ${index + 1}: ${pair.question}
        Answer ${index + 1}: ${pair.userAnswer}`).join('\n')}
        `;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const feedback = response.candidates?.[0]?.content?.parts?.[0]?.text || 'No evaluation generated';
      return feedback;
    }catch (error){
      throw new Error('Failed to evaluate answer:'+ error.message);
    }
  }
}

module.exports = new GeminiService();
