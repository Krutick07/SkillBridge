const fs = require('fs');
const pdfparse = require('pdf-parse');
const cloudinary = require('cloudinary').v2;
const geminiService = require('../service/geminiService');
const resumeAnalze = require('../Modals/resumeAnalyzeModal');

exports.uploadResume = async (req, res) => {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
  
      const filePath = req.file.path;
  
      const uploaded = await cloudinary.uploader.upload(filePath, {
        resource_type: 'raw',
        folder: 'resumes',
      });
  
      const dataBuffer = fs.readFileSync(filePath);
      const parsed = await pdfparse(dataBuffer);
      const resumeText = parsed.text; // ✅ FIXED
  
      fs.unlinkSync(filePath);
  
      const feedback = await geminiService.analyzeResume(resumeText);
  
      // Save to DB
      await resumeAnalze.create({
        resumeUrl: uploaded.secure_url,
        feedback,
        parsedText: resumeText,
      });
  
      res.status(200).json({
        resumeUrl: uploaded.secure_url,
        feedback,
      });
  
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Resume processing failed', error: error.message });
    }
  };
  