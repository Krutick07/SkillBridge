const OpenAI = require('openai');
const { learningPathprompt } = require('../utils/promptTemplates');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getLearningPath = async (skills) => {
  const prompt = learningPathprompt(skills);

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};

module.exports = { getLearningPath };
